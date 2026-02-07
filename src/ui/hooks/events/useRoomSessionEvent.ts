import {onCleanup, onMount} from 'solid-js';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {registerMessageEvent} from '../useMessageEvent';

/**
 * Listen to room session related message events in a SolidJS component.
 * Convenience wrapper around registerMessageEvent for room session events.
 * Automatically cleans up on component unmount.
 *
 * @example
 * ```tsx
 * useRoomSessionEvent(RoomReadyMessageEvent, (event, parser) => {
 *   // Handle room ready
 * });
 * ```
 */
export function useRoomSessionEvent<T extends IMessageEvent>(
	EventClass: new (callback: (event: T) => void) => T,
	handler: (event: T, parser: IMessageParser) => void
): void
{
	let cleanup: (() => void) | null = null;

	onMount(() =>
	{
		cleanup = registerMessageEvent(EventClass, handler);
	});

	onCleanup(() =>
	{
		cleanup?.();
		cleanup = null;
	});
}
