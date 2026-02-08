import {defineModule} from '../core/defineModule';
import type {LandingViewState} from './types';
import type {LandingViewActions, LandingViewManagers} from './actions';
import {createActions} from './actions';
import {handlers} from './handlers';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';

/**
 * Landing View Module
 *
 * Manages the hotel landing page data: promo articles, hall of fame, bonus rare.
 * Listens for server messages and exposes actions to request data.
 *
 * @example
 * ```typescript
 * const { state, actions } = useModule(ModuleId.LandingView);
 *
 * // Request data
 * actions.requestPromoArticles();
 *
 * // Read state
 * const articles = state().articles;
 * ```
 */
export const landingViewModule = defineModule({
	id: 'landingview',

	depends: [],

	managerIIDs: {
		communication: IID_HabboCommunicationManager,
	} satisfies Record<keyof LandingViewManagers, unknown>,

	initialState: {
		articles: null,
		hallOfFame: null,
		bonusRare: null,
	} satisfies LandingViewState,

	handlers,
	actions: createActions,
});

export type {LandingViewState, BonusRareInfo} from './types';
export type {LandingViewActions, LandingViewManagers} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds'
{
	interface ModuleStateMap
	{
		'landingview': LandingViewState;
	}

	interface ModuleActionsMap
	{
		'landingview': LandingViewActions;
	}
}
