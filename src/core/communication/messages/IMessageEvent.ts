import type {IConnection} from '../connection/IConnection';
import type {IMessageParser} from './IMessageParser';

/**
 * Callback function type for message events
 */
export type MessageEventCallback = (event: IMessageEvent) => void;

/**
 * Constructor type for parser classes
 */
export type ParserClass<T extends IMessageParser = IMessageParser> = new () => T;

/**
 * Interface for message event handlers
 * Links an incoming message type to a callback function
 */
export interface IMessageEvent {
    /**
     * The callback function to invoke when this message is received
     */
    readonly callback: MessageEventCallback;

    /**
     * The connection that received this message
     */
    connection: IConnection | null;

    /**
     * The parser class constructor
     */
    readonly parserClass: ParserClass;

    /**
     * The parser instance (shared among handlers for same message type)
     */
    parser: IMessageParser | null;

    /**
     * Clean up resources
     */
    dispose(): void;
}
