import {createEffect, createSignal, JSX, onMount, Show} from 'solid-js';
import type {IHeliumConfig} from 'helium-engine';
import {Helium, IConnectionConfig} from 'helium-engine';
import {HabboCommunicationEvent} from '@habbo/communication/enum';
import {connectionStore} from '@ui/stores/connectionStore';
import {initStores} from '@ui/stores';
import {LoadingView} from './components/loading';
import {MainView} from './components/main';
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
 * Bootstraps the engine, initializes stores, then shows
 * loading screen during connection and MainView when authenticated.
 *
 * @see source_nitro_react/App.tsx
 */
export function App(): JSX.Element
{
	const {state: connection} = connectionStore;

	const [isReady, setIsReady] = createSignal(false);
	const [message, setMessage] = createSignal('Getting Ready');
	const [percent, setPercent] = createSignal(0);
	const [isError, setIsError] = createSignal(false);
	const [imageRendering, setImageRendering] = createSignal(true);

	// Track connection state changes to update loading progress
	createEffect(() =>
	{
		const state = connection.state;

		switch (state)
		{
			case 'connecting':
				setMessage('Connecting...');
				setPercent(20);
				break;
			case 'connected':
				setMessage('Handshaking...');
				setPercent(40);
				break;
			case 'authenticated':
				setMessage('Loading...');
				setPercent(100);
				setTimeout(() => setIsReady(true), 300);
				break;
			case 'error':
				setIsError(true);
				setMessage(connection.error || 'Connection Error');
				break;
		}
	});

	// Track loading steps for finer progress
	createEffect(() =>
	{
		const step = connection.loadingStep;

		if (!step) return;

		if (step === HabboCommunicationEvent.HANDSHAKING)
		{
			setMessage('Securing connection...');
			setPercent(50);
		}
		else if (step === HabboCommunicationEvent.HANDSHAKED)
		{
			setMessage('Connection secured');
			setPercent(70);
		}
		else if (step === HabboCommunicationEvent.AUTHENTICATED)
		{
			setMessage('Authenticated');
			setPercent(90);
		}
	});

	onMount(async () =>
	{
		// Bootstrap engine (without autoConnect - stores must be wired first)
		const userConfig = window.HeliumConfig ?? {};
		const config: IHeliumConfig = {...userConfig, connection: {...userConfig.connection, autoConnect: false} as IConnectionConfig};

		const helium = await Helium.bootstrap(config);

		// Wire stores to the engine
		initStores();

		// Now connect (stores are ready to receive events)
		if (userConfig.connection?.autoConnect)
		{
			helium.connect();
		}

		// Pixel rendering
		const resize = () => setImageRendering(!(window.devicePixelRatio % 1));

		window.addEventListener('resize', resize);

		resize();
	});


	return (
		<div class={`helium-app ${imageRendering() ? 'image-rendering-pixelated' : ''}`}>
			<Show when={!isReady() || isError()}>
				<LoadingView isError={isError()} message={message()} percent={percent()} />
			</Show>
			<Show when={isReady()}>
				<MainView />
			</Show>
			<div id="draggable-windows-container" />
		</div>
	);
}
