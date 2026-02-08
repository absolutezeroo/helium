import {createStore} from 'solid-js/store';
import {registerMessageEvent} from '@ui/hooks/events/useMessageEvent';
import {PromoArticlesMessageEvent} from '@habbo/communication/messages/incoming/landingview/PromoArticlesMessageEvent';
import {
	CommunityGoalHallOfFameMessageEvent
} from '@habbo/communication/messages/incoming/quest/CommunityGoalHallOfFameMessageEvent';
import {BonusRareInfoMessageEvent} from '@habbo/communication/messages/incoming/catalog/BonusRareInfoMessageEvent';
import {GetPromoArticlesComposer} from '@habbo/communication/messages/outgoing/landingview/GetPromoArticlesComposer';
import {
	GetCommunityGoalHallOfFameMessageComposer
} from '@habbo/communication/messages/outgoing/quest/GetCommunityGoalHallOfFameMessageComposer';
import {
	GetBonusRareInfoMessageComposer
} from '@habbo/communication/messages/outgoing/catalog/GetBonusRareInfoMessageComposer';
import type {
	PromoArticlesMessageParser
} from '@habbo/communication/messages/parser/landingview/PromoArticlesMessageParser';
import type {
	CommunityGoalHallOfFameMessageParser
} from '@habbo/communication/messages/parser/quest/CommunityGoalHallOfFameMessageParser';
import type {BonusRareInfoMessageParser} from '@habbo/communication/messages/parser/catalog/BonusRareInfoMessageParser';
import {SendMessageComposer} from "@ui/api/helium/SendMessageComposer";

/**
 * Landing View Store
 *
 * Tracks the landing view state including promo articles,
 * community goal hall of fame, and bonus rare info.
 *
 * State is updated by incoming server messages registered in init().
 */

interface LandingViewStoreState
{
	articles: any[];
	hallOfFame: any | null;
	bonusRare: any | null;
}

const [state, setState] = createStore<LandingViewStoreState>({
	articles: [],
	hallOfFame: null,
	bonusRare: null,
});

const actions = {
	requestPromoArticles()
	{
		SendMessageComposer(new GetPromoArticlesComposer());
	},

	requestHallOfFame(campaign: string)
	{
		SendMessageComposer(new GetCommunityGoalHallOfFameMessageComposer(campaign));
	},

	requestBonusRare()
	{
		SendMessageComposer(new GetBonusRareInfoMessageComposer());
	},

	reset()
	{
		setState({
			articles: [],
			hallOfFame: null,
			bonusRare: null,
		});
	},
};

function init(): void
{
	registerMessageEvent(PromoArticlesMessageEvent, (event) =>
	{
		const parser = event.getParser<PromoArticlesMessageParser>();

		setState('articles', parser.articles);
	});

	registerMessageEvent(CommunityGoalHallOfFameMessageEvent, (event) =>
	{
		const parser = event.getParser<CommunityGoalHallOfFameMessageParser>();

		setState('hallOfFame', parser.data);
	});

	registerMessageEvent(BonusRareInfoMessageEvent, (event) =>
	{
		const parser = event.getParser<BonusRareInfoMessageParser>();

		setState('bonusRare', {
			productType: parser.productType,
			productClassId: parser.productClassId,
			totalCoinsForBonus: parser.totalCoinsForBonus,
			coinsStillRequiredToBuy: parser.coinsStillRequiredToBuy,
		});
	});
}

export const landingViewStore = {state, actions, init};
