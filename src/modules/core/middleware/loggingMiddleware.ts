import type {Middleware} from './types';

/**
 * Logging middleware for development
 */
export const loggingMiddleware: Middleware = (context, next) =>
{
	console.log(
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
			console.log(
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
		console.warn(`[Message] ${context.eventName} took ${duration.toFixed(2)}ms`);
	}
};
