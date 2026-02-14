import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';

/**
 * Thin reference holder for the engine toolbar instance.
 *
 * No reactive state — the views are pure bridges that wire
 * engine events to the window system directly.
 */

let _toolbar: IHabboToolbar | null = null;

/**
 * Store the engine toolbar reference.
 *
 * @param toolbar - The engine's toolbar instance
 */
export function initToolbarStore(toolbar: IHabboToolbar): void
{
	_toolbar = toolbar;
}

/**
 * Clear the toolbar reference.
 */
export function disposeToolbarStore(): void
{
	_toolbar = null;
}

/**
 * Get the engine toolbar instance.
 */
export function getToolbar(): IHabboToolbar | null
{
	return _toolbar;
}
