import type {Accessor} from 'solid-js';
import {createSignal} from 'solid-js';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowContextLayer} from '@habbo/window/enum/WindowContextLayer';

/**
 * IWindow store state.
 *
 * Exposes the desktop IWindow for each of the 4 context layers,
 * along with reactive signals that track child changes on each desktop.
 */
export interface IWindowStoreState
{
	/** Desktop IWindow per layer (index 0-3). */
	desktops: (IWindow | null)[];

	/** Reactive version counter per layer — increments on child add/remove. */
	versions: Accessor<number>[];

	/** Whether the store has been initialized. */
	initialized: boolean;
}

let _windowManager: IHabboWindowManager | null = null;
let _desktops: (IWindow | null)[] = [];
let _versionSetters: ((fn: (prev: number) => number) => void)[] = [];

const _versions: Accessor<number>[] = [];
const _versionSignals: ReturnType<typeof createSignal<number>>[] = [];

for(let i = 0; i < WindowContextLayer.COUNT; i++)
{
	const [get, set] = createSignal(0);
	_versionSignals.push([get, set]);
	_versions.push(get);
	_versionSetters.push(set);
}

const [initialized, setInitialized] = createSignal(false);

const _listeners: Map<number, { onAdd: Function; onRemove: Function }> = new Map();

/**
 * Initialize the IWindow store by connecting it to the engine's window manager.
 *
 * Listens to child add/remove events on each layer's desktop to trigger
 * reactive updates in the SolidJS rendering layer.
 *
 * @param windowManager - The engine's window manager instance
 */
export function initWindowStore(windowManager: IHabboWindowManager): void
{
	if(_windowManager)
	{
		disposeIWindowStore();
	}

	_windowManager = windowManager;
	_desktops = [];

	for(let i = 0; i < WindowContextLayer.COUNT; i++)
	{
		const desktop = windowManager.getDesktop(i);
		_desktops.push(desktop);

		if(desktop)
		{
			const layerIndex = i;

			const onAdd = (): void =>
			{
				_versionSetters[layerIndex]((v: number) => v + 1);
			};

			const onRemove = (): void =>
			{
				_versionSetters[layerIndex]((v: number) => v + 1);
			};

			desktop.addEventListener(WindowEvent.WE_CHILD_ADDED, onAdd);
			desktop.addEventListener(WindowEvent.WE_CHILD_REMOVED, onRemove);

			_listeners.set(i, { onAdd, onRemove });
		}
	}

	setInitialized(true);
}

/**
 * Dispose of the IWindow store and clean up event listeners.
 */
export function disposeIWindowStore(): void
{
	for(const [layerIndex, entry] of _listeners)
	{
		const desktop = _desktops[layerIndex];

		if(desktop && !desktop.disposed)
		{
			desktop.removeEventListener(WindowEvent.WE_CHILD_ADDED, entry.onAdd);
			desktop.removeEventListener(WindowEvent.WE_CHILD_REMOVED, entry.onRemove);
		}
	}

	_listeners.clear();
	_desktops = [];
	_windowManager = null;
	setInitialized(false);
}

/**
 * Get the desktop IWindow for a given layer.
 *
 * @param layer - The context layer index
 * @returns The desktop IWindow or null
 */
export function getIWindowDesktop(layer: number): IWindow | null
{
	return _desktops[layer] ?? null;
}

/**
 * Get the reactive version accessor for a layer.
 *
 * Reading this signal causes SolidJS to re-render when
 * children are added or removed from the desktop.
 *
 * @param layer - The context layer index
 * @returns The version accessor
 */
export function getIWindowVersion(layer: number): Accessor<number>
{
	return _versions[layer];
}

/**
 * Whether the IWindow store has been initialized.
 */
export function isIWindowStoreInitialized(): Accessor<boolean>
{
	return initialized;
}
