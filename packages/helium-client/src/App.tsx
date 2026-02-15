import {createSignal, JSX, onMount, Show} from 'solid-js';
import type {IHeliumConfig} from 'helium-engine';
import {Helium} from 'helium-engine';
import type {ElementRegistry} from '@habbo/window/ElementRegistry';
import {WindowLayerRenderer, WindowRenderer} from "./components/window/";
import {initWindowStore} from "./stores";
import {loadAtlas} from './api/skinAtlas';
import {WindowSkinContext} from './api/windowSkinContext';
import './_index.scss';

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
 * loads skin atlases, then shows the loading screen during connection
 * and MainView when authenticated.
 *
 * @see source_nitro_react/App.tsx
 */
export function App(): JSX.Element
{
	const [ready, setReady] = createSignal(false);
	const [registry, setRegistry] = createSignal<ElementRegistry | null>(null);

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

		// 3. Load skin atlas spritesheets
		try
		{
			await loadAtlas('habbo_blue_skin_png');
		}
		catch(error)
		{
			console.warn('[App] Failed to load skin atlas:', error);
		}

		// 4. Store the element registry for the skin context
		setRegistry(helium.windowManager.elementRegistry);

		// 5. Connect the SolidJS stores to the engine
		initWindowStore(helium.windowManager);

		// 6. Build a test window from JSON layout to verify the pipeline
		try
		{
			const navigatorLayout = await import('./assets/window-layouts/navigator_frame_2.json');
			const layoutData = 'default' in navigatorLayout ? navigatorLayout.default : navigatorLayout;

			const win = helium.windowManager.buildFromJSON(layoutData, 1);

			console.log('[App] Built IWindow from navigator_frame_2:', win);
		}
		catch(error)
		{
			console.warn('[App] Failed to build test window:', error);
		}

		// 7. Set Ready
		setReady(true);
	});

	return (
		<Show when={ready()} fallback={<div class="hw-loading">Loading...</div>}>
			<Show when={registry()} fallback={
				<>
					<WindowLayerRenderer />
					<WindowRenderer />
				</>
			}>
				{(reg) => (
					<WindowSkinContext.Provider value={reg()}>
						<WindowLayerRenderer />
						<WindowRenderer />
					</WindowSkinContext.Provider>
				)}
			</Show>
		</Show>
	);
}
