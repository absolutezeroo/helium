import {JSX} from 'solid-js';
import type {IHeliumConfig} from 'helium-engine';
import {WindowPreview} from './components/windowing/WindowPreview';
import './styles/window-preview.css';
import './styles/window-theme.css';

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
 * loading screen during connection and MainView when authenticated.
 *
 * @see source_nitro_react/App.tsx
 */
export function App(): JSX.Element
{
	return (
		<div class="helium-app">
			<WindowPreview />
			<div id="draggable-windows-container" />
		</div>
	);
}
