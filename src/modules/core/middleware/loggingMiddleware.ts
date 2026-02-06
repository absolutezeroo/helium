import type {Middleware} from './types';
import {Logger} from '@core/utils/Logger';

/**
 * Logging middleware for development
 * Note: Logging full parser objects can cause stack overflow in DevTools
 */
export const loggingMiddleware: Middleware = (context, next) =>
{
	// Log event name only to avoid DevTools serialization issues
	Logger.getLogger('Messages').debug(
		`%c[Message] ${context.eventName}`,
		'color: #888; font-weight: bold;',
		context.parser
	);
	next();
};

/**
 * Filtered logging middleware
 */
export function createFilteredLoggingMiddleware(pattern: RegExp): Middleware
{
	return (context, next) =>
	{
		if (pattern.test(context.eventName))
		{
			Logger.getLogger('Messages').debug(
				`%c[Message] ${context.eventName}`,
				'color: #4CAF50; font-weight: bold;',
				context.parser
			);
		}
		next();
	};
}

/**
 * Timing middleware
 */
export const timingMiddleware: Middleware = (context, next) =>
{
	const start = performance.now();
	next();
	const duration = performance.now() - start;

	if (duration > 5)
	{
		Logger.getLogger('Messages').warn(`[Message] ${context.eventName} took ${duration.toFixed(2)}ms`);
	}
};
