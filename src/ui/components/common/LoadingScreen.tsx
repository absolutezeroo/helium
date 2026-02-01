import {Component, Show} from 'solid-js';
import {connectionStore} from '../../stores';
import {HabboCommunicationEvent} from '@habbo/communication/enum';

/**
 * Loading step configuration matching AS3 login flow
 */
const LOADING_STEPS = [
	{step: HabboCommunicationEvent.INIT, label: 'Initializing...', progress: 10},
	{step: HabboCommunicationEvent.ESTABLISHED, label: 'Connected', progress: 30},
	{step: HabboCommunicationEvent.HANDSHAKING, label: 'Securing connection...', progress: 50},
	{step: HabboCommunicationEvent.HANDSHAKED, label: 'Connection secured', progress: 70},
	{step: HabboCommunicationEvent.AUTHENTICATED, label: 'Authenticated', progress: 100},
] as const;

export const LoadingScreen: Component = () =>
{
	const statusText = () =>
	{
		const step = connectionStore.loadingStep();
		const state = connectionStore.state();

		// Handle error state
		if (state === 'error')
		{
			return connectionStore.error() || 'Connection error';
		}

		// Find matching step
		if (step)
		{
			const stepConfig = LOADING_STEPS.find(s => s.step === step);
			if (stepConfig)
			{
				return stepConfig.label;
			}
		}

		// Fallback based on state
		switch (state)
		{
			case 'connecting':
				return 'Connecting to server...';
			case 'connected':
				return 'Processing...';
			case 'authenticated':
				return 'Welcome!';
			default:
				return 'Loading...';
		}
	};

	const progress = () =>
	{
		const step = connectionStore.loadingStep();

		if (step)
		{
			const stepConfig = LOADING_STEPS.find(s => s.step === step);
			if (stepConfig)
			{
				return stepConfig.progress;
			}
		}

		// Fallback
		const state = connectionStore.state();
		switch (state)
		{
			case 'connecting':
				return 15;
			case 'connected':
				return 60;
			case 'authenticated':
				return 100;
			default:
				return 0;
		}
	};

	const isError = () => connectionStore.state() === 'error';

	return (
		<div class="loading-screen">
			<div class="loading-content">
				<div class="loading-logo">
					<h1>Helium</h1>
				</div>

				<Show when={!isError()} fallback={
					<div class="loading-error">
						<div class="loading-error-icon">!</div>
						<div class="loading-error-text">{statusText()}</div>
					</div>
				}>
					<div class="loading-spinner"></div>

					{/* Progress bar */}
					<div class="loading-progress">
						<div
							class="loading-progress-bar"
							style={{width: `${progress()}%`}}
						/>
					</div>

					<div class="loading-status">{statusText()}</div>
				</Show>
			</div>
		</div>
	);
};
