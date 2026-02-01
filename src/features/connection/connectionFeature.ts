import {createRoot, createSignal} from 'solid-js';
import {HabboCommunicationEvent, type HabboCommunicationEventType} from '@habbo/communication/enum';
import type {ConnectionState, LoadingStep} from './types';

/**
 * Connection Feature
 *
 * Manages the connection state and login steps during the
 * handshake/authentication process with the Habbo server.
 *
 * @example
 * ```typescript
 * import { connection } from '@/features';
 *
 * // Read reactive state
 * if (connection.isAuthenticated()) {
 *   console.log('User is logged in');
 * }
 *
 * // Update state (called by HabboCommunicationManager)
 * connection.setConnecting();
 * connection.setAuthenticated();
 * ```
 */
function createConnectionFeature()
{
	// ========== State ==========
	const [state, setState] = createSignal<ConnectionState>('disconnected');
	const [loadingStep, setLoadingStep] = createSignal<LoadingStep>(null);
	const [error, setErrorSignal] = createSignal<string | null>(null);

	// ========== Actions ==========

	function setConnecting(): void
	{
		setState('connecting');
		setErrorSignal(null);
	}

	function setConnected(): void
	{
		setState('connected');
		setErrorSignal(null);
	}

	function setAuthenticated(): void
	{
		setState('authenticated');
		setLoadingStep(HabboCommunicationEvent.AUTHENTICATED);
		setErrorSignal(null);
	}

	function setDisconnected(): void
	{
		setState('disconnected');
		setLoadingStep(null);
		setErrorSignal(null);
	}

	function setError(message: string): void
	{
		setState('error');
		setErrorSignal(message);
	}

	/**
	 * Set the current login step from the handshake process
	 * Called by IncomingMessages during connection
	 */
	function setLoginStep(step: HabboCommunicationEventType): void
	{
		setLoadingStep(step as LoadingStep);

		// Sync main state with step
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
				setErrorSignal('Handshake failed');
				break;
		}
	}

	function reset(): void
	{
		setState('disconnected');
		setLoadingStep(null);
		setErrorSignal(null);
	}

	// ========== Public API ==========
	return {
		// State (reactive getters)
		state,
		loadingStep,
		error,

		// Computed helpers
		isConnected: () => state() === 'connected' || state() === 'authenticated',
		isAuthenticated: () => state() === 'authenticated',
		isConnecting: () => state() === 'connecting',
		hasError: () => state() === 'error',

		// Actions
		setConnecting,
		setConnected,
		setAuthenticated,
		setDisconnected,
		setError,
		setLoginStep,
		reset,
	};
}

// ========== Singleton Export ==========
export const connection = createRoot(createConnectionFeature);
export type Connection = typeof connection;
