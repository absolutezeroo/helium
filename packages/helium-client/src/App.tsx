import {createSignal, JSX, onMount, Show} from 'solid-js';
import type {IHeliumConfig} from 'helium-engine';
import {Helium} from 'helium-engine';
import {WindowLayerManager} from './components/window/WindowLayerManager';
import {initWindowStore} from './stores/windowStore';
import './_index.scss';

// Register all window element components (side effect import)
import './components/window/elements';

declare global
{
	interface Window
	{
		HeliumConfig?: IHeliumConfig;
	}
}

/**
 * App - Root application component.
 *
 * Bootstraps the engine, initializes stores, then shows
 *  the loading screen during connection, and MainView when authenticated.
 *
 * @see source_nitro_react/App.tsx
 */
export function App(): JSX.Element
{
	const [ready, setReady] = createSignal(false);

	onMount(async () =>
	{
		// 1. Bootstrap the engine (connection errors are non-fatal for the window system)
		try
		{
			await Helium.bootstrap(window.HeliumConfig);
		}
		catch(error)
		{
			console.warn('[App] Bootstrap error (connection may have failed):', error);
		}

		const helium = Helium.instance;

		// 2. Load element description into the registry
		try
		{
			const elementDescription = await import('./assets/window-skins/element-description.json');
			const data = 'default' in elementDescription ? elementDescription.default : elementDescription;

			helium.windowManager.loadElementDescription(data);
		}
		catch(error)
		{
			console.warn('[App] Failed to load element descriptions:', error);
		}

		// 3. Connect the SolidJS window store to the engine
		initWindowStore(helium.windowManager);

		setReady(true);
	});

	return (
		<Show when={ready()} fallback={<div class="hw-loading">Loading...</div>}>
			<WindowLayerManager />
		</Show>
	);
}
