import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Context passed to middlewares
 */
export interface IMiddlewareContext
{
	/** Event class name */
	eventName: string;
	/** The original event */
	event: IMessageEvent;
	/** The extracted parser */
	parser: IMessageParser;
	/** Reception timestamp */
	timestamp: number;
}

/**
 * Middleware function
 * Call next() to continue the chain
 * Don't call next() to stop propagation
 */
export type Middleware = (
	context: IMiddlewareContext,
	next: () => void
) => void;
