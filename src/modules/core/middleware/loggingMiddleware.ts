import type {Middleware} from './types';
import {Logger} from '@core/utils/Logger';

/**
 * Logging middleware for development
 * Uses console.groupCollapsed so handler logs are nested inside
 */
export const loggingMiddleware: Middleware = (context, next) =>
{
	console.groupCollapsed(
		`%c← %c${context.eventName}`,
		'color: #4CAF50; font-weight: bold',
		'color: inherit; font-weight: normal'
	);
	if (context.parser) console.log(context.parser);
	next();
	console.groupEnd();
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
			console.groupCollapsed(
				`%c← %c${context.eventName}`,
				'color: #4CAF50; font-weight: bold',
				'color: inherit; font-weight: normal'
			);
			if (context.parser) console.log(context.parser);
			next();
			console.groupEnd();
		}
		else
		{
			next();
		}
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
