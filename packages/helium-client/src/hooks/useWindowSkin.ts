/**
 * SolidJS hook that produces a reactive background-image CSS value for an IWindow.
 *
 * Resolves the skin descriptor, loads the skin JSON and atlas, renders the
 * 9-slice pieces on an offscreen canvas, and returns the result as a data URL.
 * Results are cached by a composite key (asset|state|WxH|color).
 *
 * @see sources/flash_version/com/sulake/core/window/graphics/BitmapSkinRenderer.as
 */

import type { Accessor } from 'solid-js';
import { createSignal, createEffect, onCleanup } from 'solid-js';
import type { IWindow } from '@core/window/IWindow';
import type { ElementRegistry } from '@habbo/window/ElementRegistry';
import { resolveSkin } from '../api/skinResolver';
import { loadSkin, getSkinSync } from '../api/skinLoader';
import { getAtlas, loadAtlas } from '../api/skinAtlas';
import { renderSkinToDataUrl } from '../api/skinRenderer';
import { getCachedSkin, setCachedSkin, buildCacheKey } from '../api/skinCache';

/**
 * Reactive hook that returns a background-image CSS string for the given IWindow.
 *
 * @param win - The IWindow to render a skin for
 * @param registry - The ElementRegistry for descriptor lookups
 * @param width - Reactive width accessor
 * @param height - Reactive height accessor
 * @param state - Reactive state accessor
 * @returns A signal containing the CSS background-image value, or null
 */
export function useWindowSkin(
	win: IWindow,
	registry: ElementRegistry,
	width: Accessor<number>,
	height: Accessor<number>,
	state: Accessor<number>
): Accessor<string | null>
{
	const [background, setBackground] = createSignal<string | null>(null);
	const [skinReady, setSkinReady] = createSignal(false);

	// Resolve once on mount to determine the skin asset
	const resolution = resolveSkin(win, registry);

	if(!resolution || resolution.renderer !== 'skin' || !resolution.asset)
	{
		// Not a skin renderer — handle fill type
		if(resolution && resolution.renderer === 'fill')
		{
			const color = resolution.color;
			const r = (color >> 16) & 0xFF;
			const g = (color >> 8) & 0xFF;
			const b = color & 0xFF;

			setBackground(`rgb(${r}, ${g}, ${b})`);
		}

		return background;
	}

	const assetName = resolution.asset;

	// Kick off async loading of the skin JSON + atlas
	let disposed = false;

	(async () =>
	{
		// Load skin JSON
		const skin = getSkinSync(assetName) ?? await loadSkin(assetName);

		if(disposed || !skin) return;

		// Determine atlas name from the skin's first template
		const atlasName = skin.templates[0]?.asset ?? skin.variables?.asset ?? 'habbo_blue_skin_png';

		// Load atlas if not cached
		let atlas = getAtlas(atlasName);

		if(!atlas)
		{
			atlas = await loadAtlas(atlasName);
		}

		if(disposed || !atlas) return;

		setSkinReady(true);
	})();

	// Reactive effect: re-render when size, state, or skin readiness changes
	createEffect(() =>
	{
		if(!skinReady()) return;

		const w = width();
		const h = height();
		const s = state();

		if(w < 1 || h < 1) return;

		// Re-resolve state (it may have changed)
		const currentResolution = resolveSkin(win, registry);

		if(!currentResolution || currentResolution.renderer !== 'skin') return;

		const stateName = currentResolution.stateName;
		const color = currentResolution.color;
		const cacheKey = buildCacheKey(assetName, stateName, w, h, color);

		// Check cache first
		const cached = getCachedSkin(cacheKey);

		if(cached)
		{
			setBackground(`url(${cached})`);
			return;
		}

		// Render
		const skin = getSkinSync(assetName);

		if(!skin) return;

		const atlasName = skin.templates[0]?.asset ?? skin.variables?.asset ?? 'habbo_blue_skin_png';
		const atlas = getAtlas(atlasName);

		if(!atlas) return;

		// Try the exact state, fall back to 'default'
		let dataUrl = renderSkinToDataUrl(skin, stateName, atlas, w, h, color);

		if(!dataUrl && stateName !== 'default')
		{
			dataUrl = renderSkinToDataUrl(skin, 'default', atlas, w, h, color);
		}

		if(dataUrl)
		{
			setCachedSkin(cacheKey, dataUrl);
			setBackground(`url(${dataUrl})`);
		}
	});

	onCleanup(() =>
	{
		disposed = true;
	});

	return background;
}
