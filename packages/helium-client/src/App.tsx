import type {JSX} from 'solid-js';
import {createEffect, createSignal, onMount, Show} from 'solid-js';
import {HabboCommunicationEvent} from '@habbo/communication/enum';
import {connectionStore} from '@ui/stores/connectionStore';
import {LoadingView} from './components/loading';
import {MainView} from './components/main';

/**
 * App - Root application component.
 * Shows loading screen during connection, then MainView when authenticated.
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

	onMount(() =>
	{
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
