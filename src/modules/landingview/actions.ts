import type {ActionContext} from '../core/types';
import type {LandingViewState} from './types';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {GetPromoArticlesComposer} from '@habbo/communication/messages/outgoing/landingview/GetPromoArticlesComposer';
import {GetBonusRareInfoMessageComposer} from '@habbo/communication/messages/outgoing/catalog/GetBonusRareInfoMessageComposer';
import {GetCommunityGoalHallOfFameMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetCommunityGoalHallOfFameMessageComposer';

/**
 * Landing view manager dependencies
 */
export interface LandingViewManagers
{
	communication: IHabboCommunicationManager;
}

export function createActions(ctx: ActionContext<LandingViewState, LandingViewManagers>)
{
	const {updateState, managers} = ctx;

	return {
		/**
		 * Request promo articles from the server
		 */
		requestPromoArticles: (): void =>
		{
			managers.communication.connection?.send(new GetPromoArticlesComposer());
		},

		/**
		 * Request bonus rare info from the server
		 */
		requestBonusRare: (): void =>
		{
			managers.communication.connection?.send(new GetBonusRareInfoMessageComposer());
		},

		/**
		 * Request community goal hall of fame from the server
		 */
		requestHallOfFame: (campaign: string = ''): void =>
		{
			managers.communication.connection?.send(new GetCommunityGoalHallOfFameMessageComposer(campaign));
		},

		/**
		 * Reset landing view state
		 */
		reset: (): void =>
		{
			updateState({
				articles: null,
				hallOfFame: null,
				bonusRare: null,
			});
		},
	};
}

export type LandingViewActions = ReturnType<typeof createActions>;
