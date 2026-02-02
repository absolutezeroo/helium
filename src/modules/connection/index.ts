import {defineModule} from '../core/defineModule';
import type {ConnectionState} from './types';
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
		state: 'disconnected' as ConnectionState['state'],
		loadingStep: null as ConnectionState['loadingStep'],
		error: null as ConnectionState['error'],
	} satisfies ConnectionState,

	handlers: {},

	actions: createActions,
});

export type {ConnectionState, ConnectionStateType, LoadingStep} from './types';
export type {ConnectionActions} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds' {
	interface ModuleStateMap {
		'connection': ConnectionState;
	}
	interface ModuleActionsMap {
		'connection': ConnectionActions;
	}
}
