import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

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
	parser: unknown;
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
