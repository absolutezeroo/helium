import {createSignal, JSX, onMount, Show} from 'solid-js';
import type {IHeliumConfig} from 'helium-engine';
import {Helium} from 'helium-engine';
import {WindowLayerRenderer, WindowRenderer} from "./components/window/";
import {initWindowStore} from "./stores";
import './_index.scss';

// Skin spritesheet PNGs — Vite resolves these to URLs
import blueSkinUrl from './assets/images/habbo_blue_skin.png';
import skinUbuntuUrl from './assets/images/habbo_skin_ubuntu.png';
import skinIlluminaDarkUrl from './assets/images/habbo_skin_illumina_dark.png';
import skinIlluminaLightUrl from './assets/images/habbo_skin_illumina_light.png';
import habboIconsUrl from './assets/images/habbo_icons.png';
import skinUbuntuBg9Url from './assets/images/skin_ubuntu_bg_9.png';
import type {ISkinData} from "@core/window";

// Eagerly import all skin JSONs via Vite glob
const skinModules = import.meta.glob('./assets/window-skins/habbo_skin_*.json', { eager: true }) as Record<string, { default: ISkinData }>;

// Eagerly import all window layout JSONs via Vite glob
const layoutModules = import.meta.glob('./assets/window-layouts/*.json', { eager: true }) as Record<string, { default: unknown }>;

/** Atlas asset name → URL mapping. */
const ATLAS_MAP: Record<string, string> = {
	'habbo_blue_skin': blueSkinUrl,
	'habbo_skin_ubuntu': skinUbuntuUrl,
	'habbo_skin_illumina_dark': skinIlluminaDarkUrl,
	'habbo_skin_illumina_light': skinIlluminaLightUrl,
	'habbo_icons': habboIconsUrl,
	'skin_ubuntu_bg_9': skinUbuntuBg9Url,
};

declare global
{
	interface Window
	{
		HeliumConfig?: IHeliumConfig;
	}
}

/**
 * Loads an image URL as an ImageBitmap.
 *
 * @param url - The image URL
 * @returns The decoded ImageBitmap
 */
async function loadImageBitmap(url: string): Promise<ImageBitmap>
{
	const response = await fetch(url);
	const blob = await response.blob();

	return createImageBitmap(blob);
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

		// 3. Load skin spritesheet PNGs and skin JSON data
		try
		{
			// Load atlas ImageBitmaps in parallel
			const atlases = new Map<string, ImageBitmap>();
			const atlasEntries = Object.entries(ATLAS_MAP);
			const bitmaps = await Promise.all(atlasEntries.map(([, url]) => loadImageBitmap(url)));

			for(let i = 0; i < atlasEntries.length; i++)
			{
				atlases.set(atlasEntries[i][0], bitmaps[i]);
			}

			// Collect all skin JSONs into a map keyed by skin id
			const skins = new Map<string, ISkinData>();

			for(const [, mod] of Object.entries(skinModules))
			{
				const skinData = ('default' in mod ? mod.default : mod) as ISkinData;

				skins.set(skinData.id, skinData);
			}

			// Register skin renderers in the engine
			helium.windowManager.loadSkinAssets(skins, atlases);

			// console.log(`[App] Loaded ${ atlases.size } atlases, ${ skins.size } skins`);
		}
		catch(error)
		{
			console.warn('[App] Failed to load skin assets:', error);
		}

		// 4. Register all window layouts in the engine (mirrors AS3 asset library)
		{
			let count = 0;

			for(const [path, mod] of Object.entries(layoutModules))
			{
				const name = path.split('/').pop()?.replace('.json', '') ?? '';
				const data = 'default' in mod ? mod.default : mod;
				helium.windowManager.registerWidgetLayout(name, data);
				count++;
			}

			// console.log(`[App] Registered ${ count } window layouts`);
		}

		// 5. Connect the SolidJS stores to the engine
		initWindowStore(helium.windowManager);

		// 6. Initialize the Friend Bar (landing view)
		helium.initFriendBar();

		// 7. Flush microtasks
		await Promise.resolve();

		// 8. Set Ready
		setReady(true);
	});

	return (
		<Show when={ready()} fallback={<div class="hw-loading">Loading...</div>}>
			<WindowLayerRenderer />
			<WindowRenderer />
		</Show>
	);
}
