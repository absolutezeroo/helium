/**
 * Skin resolver.
 *
 * Bridges IWindow properties to skin rendering parameters by looking up
 * the element descriptor from the ElementRegistry and resolving the
 * current visual state.
 *
 * @see sources/flash_version/com/sulake/core/window/graphics/SkinContainer.as
 */

import type { IWindow } from '@core/window/IWindow';
import type { ElementRegistry } from '@habbo/window/ElementRegistry';

// ── State flag constants (from stateMap in element-description.json) ─

const STATE_HOVERING = 4;
const STATE_SELECTED = 8;
const STATE_PRESSED = 16;
const STATE_DISABLED = 32;

// ── Interfaces ───────────────────────────────────────────────────────

/**
 * Resolved skin parameters for rendering.
 */
export interface ISkinResolution
{
	/** The renderer type */
	renderer: string;

	/** The skin asset name (e.g. 'habbo_skin_frame_xml') */
	asset: string;

	/** The layout name within the skin */
	layout: string;

	/** The resolved state name (e.g. 'default', 'hovering', 'pressed') */
	stateName: string;

	/** The colorize color */
	color: number;
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Resolve skin rendering parameters for an IWindow.
 *
 * Looks up the element descriptor by type+style, then determines
 * the visual state from the window's state flags.
 *
 * @param win - The IWindow to resolve
 * @param registry - The element registry
 * @returns The resolved skin parameters, or null if no descriptor found
 */
export function resolveSkin(win: IWindow, registry: ElementRegistry): ISkinResolution | null
{
	const descriptor = registry.getDescriptor(win.type, win.style);

	if(!descriptor) return null;

	const renderer = descriptor.renderer;

	if(!renderer || renderer === 'null') return null;

	const stateName = resolveStateName(win.state);

	return {
		renderer,
		asset: descriptor.asset,
		layout: descriptor.layout,
		stateName,
		color: extractRGB(win.color !== 0 ? win.color : descriptor.defaults.color),
	};
}

// ── Private helpers ──────────────────────────────────────────────────

/**
 * Resolve the state name from window state flags.
 *
 * Priority (descending):
 * - disabled (flag 32)
 * - pressed (flag 16)
 * - selected (flag 8)
 * - hovering (flag 4)
 * - default
 */
function resolveStateName(state: number): string
{
	if(state & STATE_DISABLED) return 'disabled';
	if(state & STATE_PRESSED) return 'pressed';
	if(state & STATE_SELECTED) return 'selected';
	if(state & STATE_HOVERING) return 'hovering';

	return 'default';
}

/**
 * Extract RGB from a color value.
 *
 * Handles both 0xAARRGGBB (32-bit with alpha) and 0xRRGGBB (24-bit) formats.
 * Returns the lower 24 bits (RGB only).
 */
function extractRGB(color: number): number
{
	// If the color is a 32-bit ARGB value, take the lower 24 bits
	return (color & 0x00FFFFFF) >>> 0;
}
