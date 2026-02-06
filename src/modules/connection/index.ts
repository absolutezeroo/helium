import {defineModule} from '../core/defineModule';
import type {IConnectionState} from './types';
import type {ConnectionActions} from './actions';
import {createActions} from './actions';

/**
 * Connection Module
 *
 * Manages the connection state and login steps during the
 * handshake/authentication process with the Habbo server.
 *
 * This module has no manager dependencies or message handlers.
 * State is updated by HabboCommunicationManager via actions.
 *
 * @example
 * ```typescript
 * const { state, actions } = useModule(ModuleId.Connection);
 *
 * // Check state
 * if (actions.isAuthenticated()) {
 *   console.log('User is logged in');
 * }
 *
 * // React to state changes
 * <Show when={state.state === 'connecting'}>
 *   <LoadingSpinner step={state.loadingStep} />
 * </Show>
 * ```
 */
export const connectionModule = defineModule({
	id: 'connection',

	depends: [],

	managerIIDs: {},

	initialState: {
		state: 'disconnected' as IConnectionState['state'], // cast: type assertion required
		loadingStep: null as IConnectionState['loadingStep'],
		error: null as IConnectionState['error'], // cast: type assertion required
	} satisfies IConnectionState,

	handlers: {},

	actions: createActions,
});

export type {IConnectionState, ConnectionStateType, LoadingStep} from './types';
export type {ConnectionActions} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds'
{
	interface IModuleStateMap
	{
		'connection': IConnectionState;
	}

	interface IModuleActionsMap
	{
		'connection': ConnectionActions;
	}
}
