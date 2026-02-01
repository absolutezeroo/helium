import {createRoot, createSignal} from 'solid-js';
import {HabboCommunicationEvent, type HabboCommunicationEventType} from '@habbo/communication/enum';

/**
 * Connection states matching AS3 HabboCommunicationEvent flow
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'error';

/**
 * Detailed loading step matching AS3 dispatchLoginStepEvent()
 */
export type LoadingStep =
	| typeof HabboCommunicationEvent.INIT
	| typeof HabboCommunicationEvent.ESTABLISHED
	| typeof HabboCommunicationEvent.HANDSHAKING
	| typeof HabboCommunicationEvent.HANDSHAKED
	| typeof HabboCommunicationEvent.HANDSHAKE_FAIL
	| typeof HabboCommunicationEvent.AUTHENTICATED
	| null;

function createConnectionStore()
{
	const [state, setState] = createSignal<ConnectionState>('disconnected');
	const [loadingStep, setLoadingStep] = createSignal<LoadingStep>(null);
	const [error, setError] = createSignal<string | null>(null);

	return {
		// Getters
		state,
		loadingStep,
		error,

		// Actions
		setConnecting: () =>
		{
			setState('connecting');
			setError(null);
		},
		setConnected: () =>
		{
			setState('connected');
			setError(null);
		},
		setAuthenticated: () =>
		{
			setState('authenticated');
			setLoadingStep(HabboCommunicationEvent.AUTHENTICATED);
			setError(null);
		},
		setDisconnected: () =>
		{
			setState('disconnected');
			setLoadingStep(null);
		},
		setError: (message: string) =>
		{
			setState('error');
			setError(message);
		},

		/**
		 * Set detailed loading step from AS3 login flow
		 */
		setLoginStep: (step: HabboCommunicationEventType) =>
		{
			setLoadingStep(step as LoadingStep);

			// Also update the main state based on step
			switch (step)
			{
				case HabboCommunicationEvent.INIT:
					setState('connecting');
					break;
				case HabboCommunicationEvent.ESTABLISHED:
				case HabboCommunicationEvent.HANDSHAKING:
				case HabboCommunicationEvent.HANDSHAKED:
					setState('connected');
					break;
				case HabboCommunicationEvent.AUTHENTICATED:
					setState('authenticated');
					break;
				case HabboCommunicationEvent.HANDSHAKE_FAIL:
					setState('error');
					setError('Handshake failed');
					break;
			}
		},

		// Computed
		isConnected: () => state() === 'connected' || state() === 'authenticated',
		isAuthenticated: () => state() === 'authenticated',
	};
}

// Create singleton store
export const connectionStore = createRoot(createConnectionStore);
