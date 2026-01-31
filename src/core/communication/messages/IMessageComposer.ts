/**
 * Interface for outgoing message composers
 * Each composer represents a specific message type to send to the server
 */
export interface IMessageComposer {
    /**
     * Get the array of values to encode in the message
     * Values can be: string, number, boolean, Byte, Short, Long, ByteArray
     */
    getMessageArray(): unknown[];

    /**
     * Clean up resources
     */
    dispose(): void;
}
