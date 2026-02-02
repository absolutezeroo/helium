import {onCleanup, onMount} from 'solid-js';
import Helium from '@/Helium';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Enregistre un message event (pour stores/services)
 * Retourne une fonction cleanup à appeler manuellement
 *
 * @example
 * ```ts
 * const cleanup = registerMessageEvent(NavigatorSearchResultSetMessageEvent, (event, parser) => {
 *   setResults((parser as NavigatorSearchResultSetMessageParser).searchResult);
 * });
 *
 * // Plus tard
 * cleanup();
 * ```
 */
export function registerMessageEvent<T extends IMessageEvent>(
	EventClass: new (callback: (event: T) => void) => T,
	handler: (event: T, parser: IMessageParser) => void
): () => void
{
	const comm = Helium.instance.habboCommunication;

	const event = new EventClass((evt: T) =>
	{
		if (!evt) return;

		const parser = evt.parser;

		if (!parser) return;

		handler(evt, parser);
	});

	comm.addMessageEvent(event);

	return () => comm.removeMessageEvent(event);
}

/**
 * Hook pour écouter un message event (pour composants)
 * Cleanup automatique via lifecycle SolidJS
 *
 * @example
 * ```tsx
 * useMessageEvent(NavigatorSearchResultSetMessageEvent, (event, parser) => {
 *   setResults((parser as NavigatorSearchResultSetMessageParser).searchResult);
 * });
 * ```
 */
export function useMessageEvent<T extends IMessageEvent>(
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
