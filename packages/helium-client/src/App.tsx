import {createSignal, JSX, onMount, Show} from 'solid-js';
import type {IHeliumConfig} from 'helium-engine';
import {Helium} from 'helium-engine';
import {WindowLayerManager} from './components/window/WindowLayerManager';
import {ToolbarView} from './components/toolbar/ToolbarView';
import {initWindowStore} from './stores/windowStore';
import {initToolbarStore} from './stores/toolbarStore';
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
 * Bootstraps the engine, initializes stores, registers window layouts,
 * then shows the loading screen during connection and MainView when authenticated.
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

		// 3. Register window layouts with the window manager
		//    This mirrors AS3's asset library where layouts were available by name
		//    via assets.getAssetByName("navigator_frame_2_xml")
		await registerWindowLayouts(helium);

		// 4. Connect the SolidJS stores to the engine
		initWindowStore(helium.windowManager);
		initToolbarStore(helium.toolbar);

		setReady(true);
	});

	return (
		<Show when={ready()} fallback={<div class="hw-loading">Loading...</div>}>
			<WindowLayerManager />
			<ToolbarView />
		</Show>
	);
}

/**
 * Load and register all window layout JSON files with the window manager.
 *
 * In AS3, these were loaded as assets into the component's asset library.
 * Here we load them from JSON and register them by name so the engine
 * can access them via `windowManager.getLayout(name)`.
 */
async function registerWindowLayouts(helium: typeof Helium.instance): Promise<void>
{
	const layoutImports: Record<string, () => Promise<unknown>> = {
		'navigator_frame_2': () => import('./assets/window-layouts/navigator_frame_2.json'),
	};

	for(const [name, loader] of Object.entries(layoutImports))
	{
		try
		{
			const module = await loader();
			const layout = 'default' in (module as Record<string, unknown>) ? (module as Record<string, unknown>).default : module;

			helium.windowManager.registerLayout(name, layout as Parameters<typeof helium.windowManager.registerLayout>[1]);
		}
		catch(error)
		{
			console.warn(`[App] Failed to load layout: ${name}`, error);
		}
	}
}
