import {inject, injectable} from 'inversify';
import {TYPES} from '@iid/types';
import {ArcFour} from '@core/communication/encryption/ArcFour';
import {DiffieHellman} from '@core/communication/encryption/DiffieHellman';
import {Logger} from '@core/utils/Logger';
import {HabboMessages} from './HabboMessages';
import {IncomingMessages} from './demo/IncomingMessages';
import {SessionDataManager} from '../session/SessionDataManager';
import {uiBridge} from '@ui/UIBridge';
import type {IHabboCommunicationManager} from './IHabboCommunicationManager';
import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IConnectionCallback} from '@core/communication/connection/IConnectionCallback';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageConfiguration} from '@core/communication/messages/IMessageConfiguration';
import type {IEncryption} from '@core/communication/encryption/IEncryption';
import type {IKeyExchange} from '@core/communication/encryption/IKeyExchange';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {ISessionDataManager} from '../session/ISessionDataManager';

const log = Logger.getLogger('Communication');

export interface HabboConnectionConfig {
    host: string;
    ports: number[];
    ssoTicket?: string;
}

@injectable()
export class HabboCommunicationManager implements IHabboCommunicationManager, IConnectionCallback {
    private communicationManager: ICoreCommunicationManager;
    private messageConfig: IMessageConfiguration;
    private incomingMessages: IncomingMessages | null = null;
    private config: HabboConnectionConfig | null = null;
    private portIndex: number = -1;
    private connectionAttempt: number = 1;
    private maxConnectionAttempts: number = 2;

    constructor(
        @inject(TYPES.CommunicationManager) communicationManager: ICoreCommunicationManager
    ) {
        this.communicationManager = communicationManager;
        this.messageConfig = new HabboMessages();
    }

    private _sessionDataManager: SessionDataManager | null = null;

    get sessionDataManager(): ISessionDataManager | null {
        return this._sessionDataManager;
    }

    private _connection: IConnection | null = null;

    get connection(): IConnection | null {
        return this._connection;
    }

    private _ssoTicket: string | null = null;

    get ssoTicket(): string | null {
        return this._ssoTicket;
    }

    set ssoTicket(value: string | null) {
        this._ssoTicket = value;
    }

    get isConnected(): boolean {
        return this._connection?.connected ?? false;
    }

    get messages(): IMessageConfiguration {
        return this.messageConfig;
    }

    configure(config: HabboConnectionConfig): void {
        this.config = config;
        this._ssoTicket = config.ssoTicket || null;
    }

    initConnection(type: string): void {
        if (type !== 'habbo') {
            log.warn(`Unknown connection type: ${type}`);
            return;
        }

        if (!this.config) {
            throw new Error('Connection not configured. Call configure() first.');
        }

        if (!this._connection) {
            this._connection = this.communicationManager.createConnection(this);
            this._connection.registerMessageClasses(this.messageConfig);
        }

        // Dispose previous instances
        if (this.incomingMessages) {
            this.incomingMessages.dispose();
        }
        if (this._sessionDataManager) {
            this._sessionDataManager.dispose();
        }

        // Create new instances
        this.incomingMessages = new IncomingMessages(this);
        this._sessionDataManager = new SessionDataManager(this);

        this.portIndex = -1;
        this.connectionAttempt = 1;
        this.tryNextPort();
    }

    addMessageEvent(event: IMessageEvent): IMessageEvent {
        this._connection?.addMessageEvent(event);
        return event;
    }

    removeMessageEvent(event: IMessageEvent): void {
        this._connection?.removeMessageEvent(event);
    }

    createEncryption(): IEncryption {
        return new ArcFour();
    }

    createKeyExchange(prime: string, generator: string): IKeyExchange {
        return new DiffieHellman(prime, generator);
    }

    disconnect(): void {
        this._connection?.close();
    }

    // IConnectionCallback
    connectionInit(host: string, port: number): void {
        log.info(`Connecting to ${host}:${port}...`);
        uiBridge.setConnectionState('connecting');
    }

    connectionOpened(): void {
        log.success('Connected to server');
        uiBridge.setConnectionState('connected');
    }

    connectionClosed(): void {
        log.info('Connection closed');
        uiBridge.setConnectionState('disconnected');
    }

    connectionError(error: Error): void {
        log.error(`Connection error: ${error.message}`);
        // Only set error state if we've exhausted all retry attempts
        if (this.connectionAttempt >= this.maxConnectionAttempts &&
            this.portIndex >= (this.config?.ports.length ?? 0) - 1) {
            uiBridge.setConnectionState('error', error.message);
        }
        this.tryNextPort();
    }

    messageReceived(messageId: number, messageName: string): void {
        log.incoming(messageId, messageName);
    }

    messageSent(messageId: number, messageName: string): void {
        log.outgoing(messageId, messageName);
    }

    messageParseError(message: IMessageDataWrapper, error: Error): void {
        log.error(`Failed to parse message ${message.getMessageId()}: ${error.message}`);
    }

    private tryNextPort(): void {
        if (!this._connection || !this.config) return;
        if (this._connection.connected) return;

        this.portIndex++;

        if (this.portIndex >= this.config.ports.length) {
            this.connectionAttempt++;

            if (this.connectionAttempt > this.maxConnectionAttempts) {
                log.failure('Failed to connect after all attempts');
                return;
            }

            this.portIndex = 0;
        }

        const port = this.config.ports[this.portIndex];
        this._connection.timeout = this.connectionAttempt * 10000;
        this._connection.init(this.config.host, port);
    }
}
