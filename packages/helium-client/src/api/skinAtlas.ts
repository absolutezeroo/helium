/**
 * Spritesheet atlas loader.
 *
 * Loads skin spritesheet PNGs as HTMLImageElement for use by the skin renderer.
 * Each atlas is cached after first load. HTMLImageElement is used directly
 * with ctx.drawImage() — no need for fetch/blob/ImageBitmap roundtrip.
 *
 * @see sources/flash_version/com/sulake/core/window/graphics/BitmapSkinRenderer.as
 */

import blueSkinUrl from '../assets/images/blue_skin.png';
import skinUbuntuUrl from '../assets/images/skin_ubuntu.png';
import skinIlluminaDarkUrl from '../assets/images/skin_illumina_dark.png';
import skinIlluminaLightUrl from '../assets/images/skin_illumina_light.png';

// ── Atlas map ────────────────────────────────────────────────────────

/**
 * Maps atlas asset names to their imported URLs.
 */
const ATLAS_MAP: Record<string, string> = {
	'habbo_blue_skin_png': blueSkinUrl,
	'habbo_skin_ubuntu_png': skinUbuntuUrl,
	'skin_illumina_dark': skinIlluminaDarkUrl,
	'skin_illumina_light': skinIlluminaLightUrl,
};

/**
 * In-memory cache of loaded atlas images.
 */
const atlasCache: Map<string, HTMLImageElement> = new Map();

/**
 * In-flight loading promises to avoid duplicate loads.
 */
const atlasLoading: Map<string, Promise<HTMLImageElement>> = new Map();

// ── Public API ───────────────────────────────────────────────────────

/**
 * Load a spritesheet atlas by name.
 *
 * Loads the image via HTMLImageElement and caches the result.
 *
 * @param name - The atlas asset name (e.g. 'habbo_blue_skin_png')
 * @returns The loaded HTMLImageElement
 */
export async function loadAtlas(name: string): Promise<HTMLImageElement>
{
	const cached = atlasCache.get(name);

	if(cached) return cached;

	const inflight = atlasLoading.get(name);

	if(inflight) return inflight;

	const url = ATLAS_MAP[name];

	if(!url)
	{
		throw new Error(`[skinAtlas] Unknown atlas: ${name}`);
	}

	const promise = new Promise<HTMLImageElement>((resolve, reject) =>
	{
		const img = new Image();

		img.onload = () =>
		{
			atlasCache.set(name, img);
			atlasLoading.delete(name);
			resolve(img);
		};

		img.onerror = () =>
		{
			atlasLoading.delete(name);
			reject(new Error(`[skinAtlas] Failed to load atlas: ${name}`));
		};

		img.src = url;
	});

	atlasLoading.set(name, promise);

	return promise;
}

/**
 * Get a previously loaded atlas synchronously.
 *
 * @param name - The atlas asset name
 * @returns The HTMLImageElement, or null if not yet loaded
 */
export function getAtlas(name: string): HTMLImageElement | null
{
	return atlasCache.get(name) ?? null;
}

/**
 * Clear the atlas cache.
 */
export function clearAtlasCache(): void
{
	atlasCache.clear();
	atlasLoading.clear();
}
