import {createRoot, createSignal} from 'solid-js';
import {HabboCommunicationEvent, type HabboCommunicationEventType} from '@habbo/communication/enum';

// ============================================================================
// Types
// ============================================================================

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'error';

export type LoadingStep =
	| typeof HabboCommunicationEvent.INIT
	| typeof HabboCommunicationEvent.ESTABLISHED
	| typeof HabboCommunicationEvent.HANDSHAKING
	| typeof HabboCommunicationEvent.HANDSHAKED
	| typeof HabboCommunicationEvent.HANDSHAKE_FAIL
	| typeof HabboCommunicationEvent.AUTHENTICATED
	| null;

// ============================================================================
// Feature
// ============================================================================

function createConnectionFeature()
{
	// State
	const [state, setState] = createSignal<ConnectionState>('disconnected');
	const [loadingStep, setLoadingStep] = createSignal<LoadingStep>(null);
	const [error, setError] = createSignal<string | null>(null);

	// Actions
	function setConnecting()
	{
		setState('connecting');
		setError(null);
	}

	function setConnected()
	{
		setState('connected');
		setError(null);
	}

	function setAuthenticated()
	{
		setState('authenticated');
		setLoadingStep(HabboCommunicationEvent.AUTHENTICATED);
		setError(null);
	}

	function setDisconnected()
	{
		setState('disconnected');
		setLoadingStep(null);
		setError(null);
	}

	function setConnectionError(message: string)
	{
		setState('error');
		setError(message);
	}

	function setLoginStep(step: HabboCommunicationEventType)
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
	}

	function reset()
	{
		setState('disconnected');
		setLoadingStep(null);
		setError(null);
	}

	return {
		// State (reactive)
		state,
		loadingStep,
		error,

		// Computed
		isConnected: () => state() === 'connected' || state() === 'authenticated',
		isAuthenticated: () => state() === 'authenticated',
		isConnecting: () => state() === 'connecting',
		hasError: () => state() === 'error',

		// Actions
		setConnecting,
		setConnected,
		setAuthenticated,
		setDisconnected,
		setConnectionError,
		setLoginStep,
		reset,
	};
}

// Singleton instance
export const connection = createRoot(createConnectionFeature);
export type Connection = typeof connection;
