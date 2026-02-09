import {onCleanup} from 'solid-js';
import type {EventEmitter} from 'eventemitter3';

/**
 * SolidJS hook to subscribe to EventEmitter3 events.
 *
 * Registers the event listener on mount and automatically
 * unregisters it when the component unmounts via `onCleanup`.
 *
 * Supports single event type or an array of event types.
 *
 * @param type - Event type(s) to listen for
 * @param emitter - The EventEmitter3 instance (e.g. manager.events)
 * @param handler - Callback invoked when the event fires
 *
 * @see source_nitro_react/src/hooks/events/useEventDispatcher.tsx
 *
 * @example
 * ```tsx
 * useEventDispatcher('searchResults', navigator.events, (results) => {
 *     setResults(results);
 * });
 *
 * // Multiple event types
 * useEventDispatcher(['created', 'ended'], roomSessionManager.sessionEvents, (event) => {
 *     // ...
 * });
 * ```
 */
export function useEventDispatcher<T = unknown>(
	type: string | string[],
	emitter: EventEmitter,
	handler: (event: T) => void
): void
{
	if (Array.isArray(type))
	{
		for (const name of type)
		{
			emitter.on(name, handler);
		}
	}
	else
	{
		emitter.on(type, handler);
	}

	onCleanup(() =>
	{
		if (Array.isArray(type))
		{
			for (const name of type)
			{
				emitter.off(name, handler);
			}
		}
		else
		{
			emitter.off(type, handler);
		}
	});
}
