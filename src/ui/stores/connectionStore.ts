import {createStore} from 'solid-js/store';
import type {HabboCommunicationEventType} from '@habbo/communication/enum/HabboCommunicationEvent';

/**
 * Connection Store
 *
 * Tracks the WebSocket connection lifecycle.
 * No message handlers - state is updated by HabboCommunicationManager callbacks.
 *
 * SolidJS equivalent of Nitro's connection state management.
 */

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'authenticated' | 'disconnected' | 'error';

interface ConnectionStoreState
{
	state: ConnectionState;
	loadingStep: HabboCommunicationEventType | null;
	error: string | null;
}

const [state, setState] = createStore<ConnectionStoreState>({
	state: 'idle',
	loadingStep: null,
	error: null,
});

const actions = {
	setConnecting()
	{
		setState({state: 'connecting', error: null});
	},

	setConnected()
	{
		setState({state: 'connected', error: null});
	},

	setAuthenticated()
	{
		setState({state: 'authenticated', error: null});
	},

	setDisconnected()
	{
		setState({state: 'disconnected'});
	},

	setError(message: string)
	{
		setState({state: 'error', error: message});
	},

	setLoginStep(step: HabboCommunicationEventType)
	{
		setState('loadingStep', step);
	},

	reset()
	{
		setState({state: 'idle', loadingStep: null, error: null});
	},
};

export type ConnectionActions = typeof actions;

// Re-export for backward compatibility - actions satisfies IConnectionActions
export const connectionStore = {state, actions};
