import {ByteArray} from '../util/ByteArray';
import type {IMessageDataWrapper} from '../messages/IMessageDataWrapper';
import type {IConnection} from '../connection/IConnection';

/**
 * Interface for message encoding/decoding
 */
export interface IWireFormatter {
    /**
     * Encode a message for sending
     * @param messageId The message ID
     * @param messageArray Array of values to encode
     * @returns Encoded message as ByteArray
     */
    encode(messageId: number, messageArray: unknown[]): ByteArray;

    /**
     * Split received data into individual messages
     * @param buffer The received data buffer
     * @param connection The connection (for encryption)
     * @returns Array of parsed message wrappers
     */
    splitMessages(buffer: ByteArray, connection: IConnection): IMessageDataWrapper[];

    /**
     * Clean up resources
     */
    dispose(): void;
}
