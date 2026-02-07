import {Component, Show} from 'solid-js';
import {ModuleId, useModule} from '../bridge';
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
	const {state: connection} = useModule(ModuleId.Connection);

	const statusText = () =>
	{
		const step = connection().loadingStep;
		const state = connection().state;

		if (state === 'error')
		{
			return connection().error || 'Connection error';
		}

		if (step)
		{
			const stepConfig = LOADING_STEPS.find(s => s.step === step);
			if (stepConfig) return stepConfig.label;
		}

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
		const step = connection().loadingStep;

		if (step)
		{
			const stepConfig = LOADING_STEPS.find(s => s.step === step);
			if (stepConfig) return stepConfig.progress;
		}

		const state = connection().state;
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

	const isError = () => connection().state === 'error';

	return (
		<div class="absolute inset-0 bg-gradient-to-br from-bg-primary to-bg-secondary flex justify-center items-center z-[1000]">
			<div class="text-center">
				<div class="mb-8">
					<h1 class="text-5xl font-bold bg-gradient-to-br from-accent to-purple-500 bg-clip-text text-transparent">
						Helium
					</h1>
				</div>

				<Show when={!isError()} fallback={
					<div class="flex flex-col items-center gap-4">
						<div class="w-12 h-12 bg-error/15 border-2 border-error rounded-full flex items-center justify-center text-2xl font-bold text-error">
							!
						</div>
						<div class="text-sm text-error max-w-[280px] text-center">
							{statusText()}
						</div>
					</div>
				}>
					<div class="w-12 h-12 border-3 border-border border-t-accent rounded-full animate-spin mx-auto mb-6"/>

					<div class="w-[200px] h-1 bg-border rounded-full mx-auto mb-4 overflow-hidden">
						<div
							class="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full transition-all duration-300"
							style={{width: `${progress()}%`}}
						/>
					</div>

					<div class="text-sm text-text-muted">{statusText()}</div>
				</Show>
			</div>
		</div>
	);
};
