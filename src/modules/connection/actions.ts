import {HabboCommunicationEvent, type HabboCommunicationEventType} from '@habbo/communication/enum';
import type {IActionContext} from '../core/types';
import type {IConnectionState, ConnectionStateType, LoadingStep} from './types';

// Connection module has no managers - it's controlled by HabboCommunicationManager
type Managers = Record<string, never>;

export function createActions(ctx: IActionContext<IConnectionState, Managers>)
{
	const {getState, updateState} = ctx;

	return {
		/**
		 * Set state to connecting
		 */
		setConnecting: (): void =>
		{
			updateState({
				state: 'connecting',
				error: null,
			});
		},

		/**
		 * Set state to connected
		 */
		setConnected: (): void =>
		{
			updateState({
				state: 'connected',
				error: null,
			});
		},

		/**
		 * Set state to authenticated
		 */
		setAuthenticated: (): void =>
		{
			updateState({
				state: 'authenticated',
				loadingStep: HabboCommunicationEvent.AUTHENTICATED,
				error: null,
			});
		},

		/**
		 * Set state to disconnected
		 */
		setDisconnected: (): void =>
		{
			updateState({
				state: 'disconnected',
				loadingStep: null,
				error: null,
			});
		},

		/**
		 * Set error state
		 */
		setError: (message: string): void =>
		{
			updateState({
				state: 'error',
				error: message,
			});
		},

		/**
		 * Set the current login step from the handshake process
		 */
		setLoginStep: (step: HabboCommunicationEventType): void =>
		{
			let newState: ConnectionStateType = getState().state;

			switch (step)
			{
				case HabboCommunicationEvent.INIT:
					newState = 'connecting';
					break;
				case HabboCommunicationEvent.ESTABLISHED:
				case HabboCommunicationEvent.HANDSHAKING:
				case HabboCommunicationEvent.HANDSHAKED:
					newState = 'connected';
					break;
				case HabboCommunicationEvent.AUTHENTICATED:
					newState = 'authenticated';
					break;
				case HabboCommunicationEvent.HANDSHAKE_FAIL:
					newState = 'error';
					updateState({
						state: 'error',
						loadingStep: step as LoadingStep, // cast: type assertion required
						error: 'Handshake failed',
					});
					return;
			}

			updateState({
				state: newState,
				loadingStep: step as LoadingStep, // cast: type assertion required
			});
		},

		/**
		 * Reset connection state
		 */
		reset: (): void =>
		{
			updateState({
				state: 'disconnected',
				loadingStep: null,
				error: null,
			});
		},

		// Computed helpers
		isConnected: (): boolean =>
		{
			const state = getState().state;

			return state === 'connected' || state === 'authenticated';
		},

		isAuthenticated: (): boolean =>
		{
			return getState().state === 'authenticated';
		},

		isConnecting: (): boolean =>
		{
			return getState().state === 'connecting';
		},

		hasError: (): boolean =>
		{
			return getState().state === 'error';
		},
	};
}

export type ConnectionActions = ReturnType<typeof createActions>;
