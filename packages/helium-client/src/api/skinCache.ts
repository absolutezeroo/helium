/**
 * LRU cache for rendered skin data URLs.
 *
 * Stores canvas-rendered skin backgrounds keyed by a composite key
 * (asset|state|widthxheight|color). Uses a simple LRU eviction strategy.
 */

const MAX_ENTRIES = 500;

/**
 * Cache storage: key -> data URL.
 */
const cache: Map<string, string> = new Map();

/**
 * Get a cached skin data URL.
 *
 * @param key - The composite cache key
 * @returns The data URL, or null if not cached
 */
export function getCachedSkin(key: string): string | null
{
	const value = cache.get(key);

	if(value === undefined) return null;

	// Move to end (most recently used)
	cache.delete(key);
	cache.set(key, value);

	return value;
}

/**
 * Store a rendered skin data URL.
 *
 * @param key - The composite cache key
 * @param dataUrl - The rendered data URL
 */
export function setCachedSkin(key: string, dataUrl: string): void
{
	// Evict oldest if at capacity
	if(cache.size >= MAX_ENTRIES)
	{
		const oldest = cache.keys().next().value;

		if(oldest !== undefined)
		{
			cache.delete(oldest);
		}
	}

	cache.set(key, dataUrl);
}

/**
 * Build a composite cache key.
 *
 * @param asset - The skin asset name
 * @param state - The state name
 * @param width - The target width
 * @param height - The target height
 * @param color - The colorize color
 * @returns The composite key string
 */
export function buildCacheKey(asset: string, state: string, width: number, height: number, color: number): string
{
	return `${asset}|${state}|${width}x${height}|${color}`;
}

/**
 * Clear the entire skin cache.
 */
export function clearSkinCache(): void
{
	cache.clear();
}
