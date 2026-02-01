import type {EventEmitter} from 'eventemitter3';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IEncryption} from '@core/communication/encryption/IEncryption';
import type {IKeyExchange} from '@core/communication/handshake/IKeyExchange';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {HabboCommunicationEventType} from './enum';

/**
 * Events emitted by HabboCommunicationManager
 * Matches AS3's context.events dispatcher for communication events
 */
export interface HabboCommunicationManagerEvents {
    /**
     * Login step changed (INIT, ESTABLISHED, HANDSHAKING, HANDSHAKED, AUTHENTICATED, etc.)
     */
    'loginStep': (step: HabboCommunicationEventType) => void;

    /**
     * Authentication successful
     */
    'authenticated': () => void;

    /**
     * Disconnected from server
     */
    'disconnected': (reason: number, reasonText: string) => void;

    /**
     * Error occurred
     */
    'error': (code: number, message: string) => void;
}

/**
 * Interface for Habbo-specific communication manager
 *
 * Based on AS3: com.sulake.habbo.communication.IHabboCommunicationManager
 */
export interface IHabboCommunicationManager extends EventEmitter<HabboCommunicationManagerEvents> {
    /**
     * Get the main Habbo connection
     */
    readonly connection: IConnection | null;

    /**
     * Get the session data manager
     */
    readonly sessionDataManager: ISessionDataManager | null;

    /**
     * Whether currently connected to server
     */
    readonly isConnected: boolean;

    /**
     * Get the SSO ticket for authentication
     */
    readonly ssoTicket: string | null;

    /**
     * Initialize connection to Habbo server
     * @param type Connection type (e.g., 'habbo', 'debug')
     */
    initConnection(type: string): void;

    /**
     * Add a message event handler
     */
    addMessageEvent(event: IMessageEvent): IMessageEvent;

    /**
     * Remove a message event handler
     */
    removeMessageEvent(event: IMessageEvent): void;

    /**
     * Create a new encryption instance
     */
    createEncryption(): IEncryption;

    /**
     * Create a new key exchange instance
     * @param prime The prime number (p)
     * @param generator The generator (g)
     */
    createKeyExchange(prime: string, generator: string): IKeyExchange;

    /**
     * Disconnect from the server
     */
    disconnect(): void;
}
