import {EventEmitter} from 'eventemitter3';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IEncryption} from '@core/communication/encryption/IEncryption';
import type {IKeyExchange} from '@core/communication/encryption/IKeyExchange';
import {CryptoTools} from '@core/communication/encryption/CryptoTools';
import {RSA} from '@core/communication/encryption/RSA';
import {SocketConnection} from '@core/communication/connection/SocketConnection';
import {Logger} from '@core/utils/Logger';
import {uiBridge} from '@ui/UIBridge';
import type {IHabboCommunicationManager} from '../IHabboCommunicationManager';

// Events
import {
    AuthenticationOKMessageEvent,
    CompleteDiffieHandshakeMessageEvent,
    DisconnectReasonMessageEvent,
    GenericErrorMessageEvent,
    InitDiffieHandshakeMessageEvent,
    PingMessageEvent,
    UniqueMachineIdMessageEvent,
} from '../messages/incoming/handshake';

// Parsers
import {
    CompleteDiffieHandshakeMessageParser,
    DisconnectReasonMessageParser,
    GenericErrorMessageParser,
    InitDiffieHandshakeMessageParser,
} from '../messages/parser/handshake';

// Composers
import {
    ClientHelloMessageComposer,
    CompleteDiffieHandshakeMessageComposer,
    InfoRetrieveMessageComposer,
    InitDiffieHandshakeMessageComposer,
    PongMessageComposer,
    SSOTicketMessageComposer,
    UniqueIDMessageComposer,
} from '../messages/outgoing/handshake';

import {EventLogMessageComposer} from '../messages/outgoing/tracking';

const log = Logger.getLogger('Handshake');

/**
 * Events emitted by IncomingMessages
 */
export interface IncomingMessagesEvents {
    'loginStep': (step: string) => void;
    'authenticated': () => void;
    'disconnected': (reason: number, reasonText: string) => void;
    'error': (code: number, message: string) => void;
}

/**
 * Handles incoming messages during connection/handshake
 */
export class IncomingMessages extends EventEmitter<IncomingMessagesEvents> {
    private _communication: IHabboCommunicationManager;
    private _messageEvents: IMessageEvent[] = [];
    private _keyExchange: IKeyExchange | null = null;
    private _privateKey: string = '';
    private _isHandshaking: boolean = false;
    private _wasDisconnected: boolean = false;
    private _rsa: RSA;

    private _boundOnConnected: () => void;
    private _boundOnDisconnected: () => void;

    constructor(communication: IHabboCommunicationManager) {
        super();
        this._communication = communication;
        this._rsa = new RSA();

        const connection = this._communication.connection as SocketConnection;

        if (!connection) {
            throw new Error('Connection is required to initialize!');
        }

        this._boundOnConnected = this.onConnectionEstablished.bind(this);
        this._boundOnDisconnected = this.onConnectionDisconnected.bind(this);

        connection.on('connected', this._boundOnConnected);
        connection.on('disconnected', this._boundOnDisconnected);

        // Register message handlers
        this.addMessageEvent(new InitDiffieHandshakeMessageEvent(this.onInitDiffieHandshake.bind(this)));
        this.addMessageEvent(new CompleteDiffieHandshakeMessageEvent(this.onCompleteDiffieHandshake.bind(this)));
        this.addMessageEvent(new AuthenticationOKMessageEvent(this.onAuthenticationOK.bind(this)));
        this.addMessageEvent(new PingMessageEvent(this.onPing.bind(this)));
        this.addMessageEvent(new DisconnectReasonMessageEvent(this.onDisconnectReason.bind(this)));
        this.addMessageEvent(new GenericErrorMessageEvent(this.onGenericError.bind(this)));
        this.addMessageEvent(new UniqueMachineIdMessageEvent(this.onUniqueMachineId.bind(this)));
    }

    dispose(): void {
        const connection = this._communication.connection as SocketConnection;
        if (connection) {
            connection.off('connected', this._boundOnConnected);
            connection.off('disconnected', this._boundOnDisconnected);
        }

        for (const event of this._messageEvents) {
            this._communication.removeMessageEvent(event);
        }
        this._messageEvents = [];
        this._keyExchange = null;
        this.removeAllListeners();
    }

    private addMessageEvent(event: IMessageEvent): void {
        this._communication.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    private onConnectionEstablished(): void {
        const connection = this._communication.connection;
        if (!connection) {
            log.error('No connection available');
            return;
        }

        this.emit('loginStep', 'HABBO_CONNECTION_EVENT_ESTABLISHED');
        this._wasDisconnected = false;
        this._isHandshaking = true;
        this.emit('loginStep', 'HABBO_CONNECTION_EVENT_HANDSHAKING');

        log.info('Starting handshake...');
        connection.sendUnencrypted(new ClientHelloMessageComposer());
        connection.sendUnencrypted(new InitDiffieHandshakeMessageComposer());
    }

    private onInitDiffieHandshake(event: IMessageEvent): void {
        const connection = event.connection;
        if (!connection) return;

        const parser = event.parser as InitDiffieHandshakeMessageParser;

        // Decrypt prime and generator using RSA
        const primeDecimal = this._rsa.decryptString(parser.encryptedPrime);
        const generatorDecimal = this._rsa.decryptString(parser.encryptedGenerator);

        // Convert decimal strings to hex for DiffieHellman
        const primeHex = BigInt(primeDecimal).toString(16);
        const generatorHex = BigInt(generatorDecimal).toString(16);

        this._keyExchange = this._communication.createKeyExchange(primeHex, generatorHex);

        // Generate random private key and compute public key
        let bestPublicKey: string | null = null;
        let attempts = 10;

        while (attempts > 0) {
            const privateKey = this.generateRandomHexString(30);
            this._keyExchange.init(privateKey);
            const publicKey = this._keyExchange.getPublicKey(10);

            if (publicKey.length >= 64) {
                bestPublicKey = publicKey;
                this._privateKey = privateKey;
                break;
            }

            if (!bestPublicKey || publicKey.length > bestPublicKey.length) {
                bestPublicKey = publicKey;
                this._privateKey = privateKey;
            }
            attempts--;
        }

        if (bestPublicKey) {
            this._keyExchange.init(this._privateKey);
        }

        // Encrypt our public key with RSA before sending
        const encryptedPublicKey = this._rsa.encryptString(bestPublicKey || '');
        connection.sendUnencrypted(new CompleteDiffieHandshakeMessageComposer(encryptedPublicKey));

        log.debug('DH public key sent');
    }

    private onCompleteDiffieHandshake(event: IMessageEvent): void {
        const connection = event.connection;
        if (!connection || !this._keyExchange) return;

        const parser = event.parser as CompleteDiffieHandshakeMessageParser;

        // Decrypt server's public key using RSA
        const serverPublicKey = this._rsa.decryptString(parser.encryptedPublicKey);

        // Generate shared secret
        this._keyExchange.generateSharedKey(serverPublicKey, 10);

        if (!this._keyExchange.isValidServerPublicKey()) {
            log.error('Invalid server public key');
            return;
        }

        // Get shared key and initialize RC4
        const sharedKeyHex = this._keyExchange.getSharedKey(16).toUpperCase();
        const keyBytes = CryptoTools.hexStringToByteArray(sharedKeyHex);

        const clientToServer = this._communication.createEncryption();
        clientToServer.init(keyBytes);

        let serverToClient: IEncryption | null = null;
        if (parser.serverClientEncryption) {
            serverToClient = this._communication.createEncryption();
            serverToClient.init(CryptoTools.hexStringToByteArray(sharedKeyHex));
        }

        connection.setEncryption(clientToServer, serverToClient!);

        this._isHandshaking = false;
        this.emit('loginStep', 'HABBO_CONNECTION_EVENT_HANDSHAKED');

        log.success('Encryption enabled');
        this.sendConnectionParameters(connection);
    }

    private sendConnectionParameters(connection: IMessageEvent['connection']): void {
        if (!connection) return;

        connection.send(new ClientHelloMessageComposer());
        connection.send(new UniqueIDMessageComposer(
            this.getMachineId(),
            this.generateFingerprint(),
            'HTML5/1.0.0'
        ));

        const ssoTicket = this._communication.ssoTicket;
        if (ssoTicket && ssoTicket.length > 0) {
            connection.send(new SSOTicketMessageComposer(ssoTicket, this.getTimer()));
            log.info('SSO ticket sent');
        } else {
            log.warn('No SSO ticket available');
        }
    }

    private onAuthenticationOK(event: IMessageEvent): void {
        const connection = event.connection;
        if (!connection) return;

        log.success('Authenticated');
        this.emit('loginStep', 'HABBO_CONNECTION_EVENT_AUTHENTICATED');

        // Notify UI that authentication succeeded
        uiBridge.setConnectionState('authenticated');

        connection.send(new InfoRetrieveMessageComposer());
        connection.send(new EventLogMessageComposer('Login', 'socket', 'client.auth_ok'));

        this.emit('authenticated');
    }

    private onPing(event: IMessageEvent): void {
        event.connection?.send(new PongMessageComposer());
    }

    private onDisconnectReason(event: IMessageEvent): void {
        const parser = event.parser as DisconnectReasonMessageParser;

        if (this._isHandshaking) {
            this.emit('loginStep', 'HABBO_CONNECTION_EVENT_HANDSHAKE_FAIL');
        }

        log.warn(`Disconnected: ${parser.reason} - ${parser.reasonText}`);
        this.emit('disconnected', parser.reason, parser.reasonText);

        this._isHandshaking = false;
        this._wasDisconnected = true;
    }

    private onGenericError(event: IMessageEvent): void {
        const parser = event.parser as GenericErrorMessageParser;
        log.error(`Server error: ${parser.errorCode}`);
        this.emit('error', parser.errorCode, `Error ${parser.errorCode}`);
    }

    private onUniqueMachineId(_event: IMessageEvent): void {
        // Machine ID received - stored by server
    }

    private onConnectionDisconnected(): void {
        if (this._isHandshaking) {
            this.emit('loginStep', 'HABBO_CONNECTION_EVENT_HANDSHAKE_FAIL');
        }

        if (!this._wasDisconnected) {
            this.emit('disconnected', -3, 'Connection closed');
        }
    }

    private generateRandomHexString(byteLength: number): string {
        let result = '';
        for (let i = 0; i < byteLength; i++) {
            const byte = Math.floor(Math.random() * 255);
            result += byte.toString(16).padStart(2, '0');
        }
        return result;
    }

    private getMachineId(): string {
        let machineId = localStorage.getItem('helium_machine_id');
        if (!machineId) {
            machineId = this.generateRandomHexString(16);
            localStorage.setItem('helium_machine_id', machineId);
        }
        return machineId;
    }

    private generateFingerprint(): string {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Helium', 2, 2);
        }

        const data = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset().toString(),
            canvas.toDataURL()
        ].join('|');

        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            hash = ((hash << 5) - hash) + data.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    private getTimer(): number {
        return Math.floor(performance.now());
    }
}
