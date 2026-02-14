import {createStore, produce} from 'solid-js/store';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {WindowManagerEvents} from '@habbo/window/IHabboWindowManager';
import type {IWindowInstance} from '@habbo/window/IWindowInstance';
import {WindowContextLayer} from '@habbo/window/enum/WindowContextLayer';

/**
 * Window store state structure.
 *
 * Groups open windows by context layer for efficient rendering.
 */
export interface WindowStoreState
{
	/** Windows indexed by layer */
	layers: IWindowInstance[][];

	/** Whether the store has been initialized */
	initialized: boolean;
}

function createInitialState(): WindowStoreState
{
	const layers: IWindowInstance[][] = [];

	for(let i = 0; i < WindowContextLayer.COUNT; i++)
	{
		layers.push([]);
	}

	return {
		layers,
		initialized: false,
	};
}

const [windowState, setWindowState] = createStore<WindowStoreState>(createInitialState());

let _windowManager: IHabboWindowManager | null = null;

/**
 * Initialize the window store by connecting it to the engine's window manager.
 *
 * Listens to window lifecycle events and updates the SolidJS store reactively.
 *
 * @param windowManager - The engine's window manager instance
 */
export function initWindowStore(windowManager: IHabboWindowManager): void
{
	if(_windowManager)
	{
		disposeWindowStore();
	}

	_windowManager = windowManager;

	windowManager.windowEvents.on(WindowManagerEvents.WINDOW_OPEN, onWindowOpen);
	windowManager.windowEvents.on(WindowManagerEvents.WINDOW_CLOSE, onWindowClose);
	windowManager.windowEvents.on(WindowManagerEvents.WINDOW_UPDATE, onWindowUpdate);

	setWindowState('initialized', true);
}

/**
 * Dispose of the window store and clean up event listeners.
 */
export function disposeWindowStore(): void
{
	if(_windowManager)
	{
		_windowManager.windowEvents.off(WindowManagerEvents.WINDOW_OPEN, onWindowOpen);
		_windowManager.windowEvents.off(WindowManagerEvents.WINDOW_CLOSE, onWindowClose);
		_windowManager.windowEvents.off(WindowManagerEvents.WINDOW_UPDATE, onWindowUpdate);
		_windowManager = null;
	}

	setWindowState(createInitialState());
}

function onWindowOpen(instance: IWindowInstance): void
{
	const layer = instance.layer;

	if(layer < 0 || layer >= WindowContextLayer.COUNT) return;

	setWindowState(produce((state) =>
	{
		state.layers[layer].push(instance);
	}));
}

function onWindowClose(instance: IWindowInstance): void
{
	const layer = instance.layer;

	if(layer < 0 || layer >= WindowContextLayer.COUNT) return;

	setWindowState(produce((state) =>
	{
		const idx = state.layers[layer].findIndex((w) => w.id === instance.id);

		if(idx >= 0)
		{
			state.layers[layer].splice(idx, 1);
		}
	}));
}

function onWindowUpdate(instance: IWindowInstance): void
{
	const layer = instance.layer;

	if(layer < 0 || layer >= WindowContextLayer.COUNT) return;

	setWindowState(produce((state) =>
	{
		const idx = state.layers[layer].findIndex((w) => w.id === instance.id);

		if(idx >= 0)
		{
			state.layers[layer][idx] = instance;
		}
	}));
}

/**
 * Get the window store state.
 */
export function useWindowStore(): WindowStoreState
{
	return windowState;
}

/**
 * Get the engine window manager instance.
 */
export function getWindowManager(): IHabboWindowManager | null
{
	return _windowManager;
}
