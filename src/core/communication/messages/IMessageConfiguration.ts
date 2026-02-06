import type {IMessageComposer} from './IMessageComposer';
import type {IMessageEvent, MessageEventCallback} from './IMessageEvent';

/**
 * Constructor type for composer classes
 */
export type ComposerClass = new (...args: any[]) => IMessageComposer<any[]>; // cast: required for dynamic constructor invocation

/**
 * Constructor type for event classes
 */
export type EventClass = new (callback: MessageEventCallback) => IMessageEvent;

/**
 * Interface for message configuration
 * Maps message IDs to their composer and event classes
 */
export interface IMessageConfiguration
{
	/**
	 * Map of message ID to incoming event class
	 */
	readonly events: Map<number, EventClass>;

	/**
	 * Map of message ID to outgoing composer class
	 */
	readonly composers: Map<number, ComposerClass>;
}
