import type {EventEmitter} from 'eventemitter3';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IEncryption} from '@core/communication/encryption/IEncryption';
import type {IKeyExchange} from '@core/communication/handshake/IKeyExchange';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {HabboCommunicationEventType} from './enum';
import type {IHabboWebApiListener} from './IHabboWebApiListener';
import type {IHabboWebApiSession} from './IHabboWebApiSession';

/**
 * Events emitted by HabboCommunicationManager
 */
export interface HabboCommunicationManagerEvents
{
	'loginStep': (step: HabboCommunicationEventType) => void;
	'authenticated': () => void;
	'disconnected': (reason: number, reasonText: string) => void;
	'error': (code: number, message: string) => void;
}

/**
 * Interface for Habbo-specific communication manager
 */
export interface IHabboCommunicationManager
{
	/**
	 * Event emitter for communication events
	 */
	readonly events: EventEmitter;
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

	/**
	 * Register a global message listener
	 * Called for ALL incoming messages after parsing
	 * @returns Unsubscribe function
	 */
	onMessage(listener: (event: IMessageEvent) => void): () => void;

	/**
	 * AS3: updateHostParameters()
	 * Reads connection.info.host and connection.info.port from configuration
	 * and updates the internal host/port list.
	 */
	updateHostParameters(): void;

	/**
	 * AS3: createHabboWebApiSession(listener, server)
	 * Creates a new HabboWebApiSession for HTTP API requests.
	 *
	 * @param listener - IHabboWebApiListener to receive API callbacks
	 * @param server - Base server URL (e.g., 'https://www.habbo.com')
	 * @returns The created IHabboWebApiSession
	 */
	createHabboWebApiSession(listener: IHabboWebApiListener, server: string): IHabboWebApiSession;

	/**
	 * AS3: getHabboWebApiSession()
	 * Returns the current HabboWebApiSession, or null if not created.
	 */
	getHabboWebApiSession(): IHabboWebApiSession | null;
}
