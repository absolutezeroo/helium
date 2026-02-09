import {onCleanup} from 'solid-js';
import {getCommunication} from '@ui/api/helium';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';

/**
 * SolidJS hook to subscribe to incoming server messages.
 *
 * Registers the message event handler on mount and automatically
 * unregisters it when the component unmounts via `onCleanup`.
 *
 * @param EventClass - The message event class constructor (e.g. `UserCreditsEvent`)
 * @param handler - Callback invoked when the message is received
 *
 * @see source_nitro_react/src/hooks/events/useMessageEvent.tsx
 *
 * @example
 * ```tsx
 * useMessageEvent(UserCreditsEvent, (event) => {
 *     const parser = event.getParser<UserCreditsMessageParser>();
 *     setCredits(parser.credits);
 * });
 * ```
 */
export function useMessageEvent<T extends IMessageEvent>(
	EventClass: new (callback: MessageEventCallback) => T,
	handler: (event: T) => void
): void
{
	const event = new EventClass(handler as MessageEventCallback);

	getCommunication().addMessageEvent(event);

	onCleanup(() => getCommunication().removeMessageEvent(event));
}

/**
 * Standalone function to register a message event handler outside of components.
 *
 * Used in store `init()` functions where `onCleanup` is not available.
 * Returns a cleanup function that can be called manually to unregister.
 *
 * @param EventClass - The message event class constructor
 * @param handler - Callback invoked when the message is received
 * @returns Cleanup function to unregister the handler
 *
 * @example
 * ```ts
 * // In a store init()
 * registerMessageEvent(UserCreditsEvent, (event) => {
 *     const parser = event.getParser<UserCreditsMessageParser>();
 *     setState('credits', parser.credits);
 * });
 * ```
 */
export function registerMessageEvent<T extends IMessageEvent>(
	EventClass: new (callback: MessageEventCallback) => T,
	handler: (event: T) => void
): () => void
{
	const event = new EventClass(handler as MessageEventCallback);

	getCommunication().addMessageEvent(event);

	return () => getCommunication().removeMessageEvent(event);
}
