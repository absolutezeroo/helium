import type {IEncryption} from '../encryption/IEncryption';
import type {IMessageComposer} from '../messages/IMessageComposer';
import type {IMessageEvent} from '../messages/IMessageEvent';
import type {IMessageConfiguration} from '../messages/IMessageConfiguration';

/**
 * Interface for network connections
 */
export interface IConnection
{
	/**
	 * Whether the connection is currently established
	 */
	readonly connected: boolean;
	/**
	 * Whether the connection has been disposed
	 */
	readonly disposed: boolean;
	/**
	 * Connection timeout in milliseconds
	 */
	timeout: number;

	/**
	 * Initialize and connect to host
	 * @param host Server hostname or IP
	 * @param port Server port (0 for WebSocket default)
	 * @returns True if connection attempt started
	 */
	init(host: string, port?: number): boolean;

	/**
	 * Send an encrypted message
	 * @param composer The message to send
	 * @returns True if message was sent
	 */
	send(composer: IMessageComposer<unknown[]>): boolean;

	/**
	 * Send an unencrypted message
	 * @param composer The message to send
	 * @returns True if message was sent
	 */
	sendUnencrypted(composer: IMessageComposer<unknown[]>): boolean;

	/**
	 * Set encryption for both directions
	 * @param clientToServer Encryption for outgoing messages
	 * @param serverToClient Encryption for incoming messages
	 */
	setEncryption(clientToServer: IEncryption, serverToClient: IEncryption): void;

	/**
	 * Get the server-to-client encryption
	 */
	getServerToClientEncryption(): IEncryption | null;

	/**
	 * Get the client-to-server encryption
	 */
	getClientToServerEncryption(): IEncryption | null;

	/**
	 * Register message classes from configuration
	 */
	registerMessageClasses(config: IMessageConfiguration): void;

	/**
	 * Add a message event handler
	 */
	addMessageEvent(event: IMessageEvent): void;

	/**
	 * Remove a message event handler
	 */
	removeMessageEvent(event: IMessageEvent): void;

	/**
	 * Process received data (call from update loop)
	 */
	processReceivedData(): void;

	/**
	 * Close the connection
	 */
	close(): void;

	/**
	 * Clean up resources
	 */
	dispose(): void;
}
