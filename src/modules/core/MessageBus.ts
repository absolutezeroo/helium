import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {Middleware, MiddlewareContext} from './middleware/types';
import {Logger} from '@core/utils/Logger';

/**
 * Central bus for server messages
 * All messages pass through here and are dispatched to registered handlers
 */
export class MessageBus
{
	private handlers = new Map<string, Set<(parser: unknown) => void>>();
	private middlewares: Middleware[] = [];

	/**
	 * Add a middleware to the chain
	 */
	use(middleware: Middleware): this
	{
		this.middlewares.push(middleware);
		return this;
	}

	/**
	 * Register a handler for a message type
	 * @param eventName Event class name (e.g., "NavigatorSearchResultSetMessageEvent")
	 * @param handler Function called with the parser
	 * @returns Unsubscribe function
	 */
	on(eventName: string, handler: (parser: unknown) => void): () => void
	{
		if (!this.handlers.has(eventName))
		{
			this.handlers.set(eventName, new Set());
		}

		this.handlers.get(eventName)!.add(handler);

		return () => this.off(eventName, handler);
	}

	/**
	 * Remove a handler
	 */
	off(eventName: string, handler: (parser: unknown) => void): void
	{
		this.handlers.get(eventName)?.delete(handler);
	}

	/**
	 * Dispatch a message to all registered handlers
	 * Middlewares are executed first
	 */
	dispatch(event: IMessageEvent): void
	{
		const parser = event.parser;

		if (!parser) return;

		const eventName = event.constructor.name;

		const context: MiddlewareContext = {
			eventName,
			event,
			parser,
			timestamp: Date.now(),
		};

		// Execute middlewares then handlers
		this.executeMiddlewareChain(context, 0, () =>
		{
			this.executeHandlers(eventName, parser);
		});
	}

	/**
	 * Returns the number of handlers registered for an event
	 */
	handlerCount(eventName: string): number
	{
		return this.handlers.get(eventName)?.size ?? 0;
	}

	/**
	 * Remove all handlers
	 */
	clear(): void
	{
		this.handlers.clear();
	}

	private executeMiddlewareChain(
		context: MiddlewareContext,
		index: number,
		done: () => void
	): void
	{
		if (index >= this.middlewares.length)
		{
			done();
			return;
		}

		const middleware = this.middlewares[index];

		try
		{
			middleware(context, () =>
			{
				this.executeMiddlewareChain(context, index + 1, done);
			});
		} catch (error)
		{
			Logger.getLogger('MessageBus').error('Middleware error:', error);

			this.executeMiddlewareChain(context, index + 1, done);
		}
	}

	private executeHandlers(eventName: string, parser: unknown): void
	{
		const handlers = this.handlers.get(eventName);

		if (!handlers || handlers.size === 0) return;

		handlers.forEach(handler =>
		{
			try
			{
				handler(parser);
			} catch (error)
			{
				Logger.getLogger('MessageBus').error(`Handler error for ${eventName}:`, error);
			}
		});
	}
}
