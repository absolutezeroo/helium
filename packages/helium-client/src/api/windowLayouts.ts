import type {IWindowLayout} from '@habbo/window/IWindowLayout';

/**
 * In-memory cache of loaded window layouts.
 */
const layoutCache = new Map<string, IWindowLayout>();

/**
 * All available layout JSON modules, loaded via Vite glob import.
 */
const layoutModules = import.meta.glob<IWindowLayout>(
	'../assets/window-layouts/*.json',
	{eager: false}
);

/**
 * Extract the layout name from a module path.
 *
 * @example '/src/assets/window-layouts/navigator_search.json' -> 'navigator_search'
 */
function extractName(modulePath: string): string
{
	const basename = modulePath.split('/').pop() ?? '';

	return basename.replace(/\.json$/, '');
}

/**
 * Build a map of layout name -> module path for fast lookup.
 */
const nameToPath = new Map<string, string>();

for (const modulePath of Object.keys(layoutModules))
{
	nameToPath.set(extractName(modulePath), modulePath);
}

/**
 * Load a window layout by name.
 *
 * Uses Vite dynamic import to lazy-load the JSON file.
 * Results are cached in memory for subsequent calls.
 *
 * @param name - The layout name (e.g. 'navigator_search')
 * @returns The layout data, or null if not found
 */
export async function loadWindowLayout(name: string): Promise<IWindowLayout | null>
{
	const cached = layoutCache.get(name);

	if (cached) return cached;

	const modulePath = nameToPath.get(name);

	if (!modulePath)
	{
		console.warn(`[windowLayouts] Layout not found: ${name}`);
		return null;
	}

	const loader = layoutModules[modulePath];

	if (!loader)
	{
		console.warn(`[windowLayouts] No loader for layout: ${name}`);
		return null;
	}

	const layout = await loader() as unknown as { default: IWindowLayout } | IWindowLayout;

	const data = 'default' in layout ? layout.default : layout;

	layoutCache.set(name, data);

	return data;
}

/**
 * Get all available layout names.
 */
export function getAvailableLayouts(): string[]
{
	return Array.from(nameToPath.keys());
}

/**
 * Clear the layout cache.
 */
export function clearLayoutCache(): void
{
	layoutCache.clear();
}
