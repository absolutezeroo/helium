import type {IMessageDataWrapper} from '../messages/IMessageDataWrapper';

/**
 * Callback interface for connection events
 */
export interface IConnectionCallback
{
	/**
	 * Called when connection is initializing
	 */
	connectionInit?(host: string, port: number): void;

	/**
	 * Called when connection is established
	 */
	connectionOpened?(): void;

	/**
	 * Called when connection is closed
	 */
	connectionClosed?(): void;

	/**
	 * Called when connection fails
	 */
	connectionError?(error: Error): void;

	/**
	 * Called when a message is received
	 * @param messageId The message ID
	 * @param messageName The message name (or 'Unknown' if not registered)
	 */
	messageReceived?(messageId: number, messageName: string): void;

	/**
	 * Called when a message is sent
	 * @param messageId The message ID
	 * @param messageName The message name (or 'Unknown' if not registered)
	 */
	messageSent?(messageId: number, messageName: string): void;

	/**
	 * Called when a message fails to parse
	 */
	messageParseError?(message: IMessageDataWrapper, error: Error): void;
}
