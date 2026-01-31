import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IEncryption} from '@core/communication/encryption/IEncryption';
import type {IKeyExchange} from '@core/communication/encryption/IKeyExchange';
import type {ISessionDataManager} from '../session/ISessionDataManager';

/**
 * Interface for Habbo-specific communication manager
 */
export interface IHabboCommunicationManager {
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
