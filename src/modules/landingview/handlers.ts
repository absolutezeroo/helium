import type {MessageHandlers} from '../core/types';
import type {LandingViewState} from './types';

// Parser types
import type {
	PromoArticlesMessageParser
} from '@habbo/communication/messages/parser/landingview/PromoArticlesMessageParser';
import type {
	CommunityGoalHallOfFameMessageParser
} from '@habbo/communication/messages/parser/quest/CommunityGoalHallOfFameMessageParser';
import type {
	BonusRareInfoMessageParser
} from '@habbo/communication/messages/parser/catalog/BonusRareInfoMessageParser';

export const handlers: MessageHandlers<LandingViewState> = {

	/**
	 * Promo articles received from server
	 */
	PromoArticlesMessageEvent: (parser: PromoArticlesMessageParser): Partial<LandingViewState> => ({
		articles: parser.articles,
	}),

	/**
	 * Community goal hall of fame received
	 */
	CommunityGoalHallOfFameMessageEvent: (parser: CommunityGoalHallOfFameMessageParser): Partial<LandingViewState> => ({
		hallOfFame: parser.data,
	}),

	/**
	 * Bonus rare info received from catalog
	 */
	BonusRareInfoMessageEvent: (parser: BonusRareInfoMessageParser): Partial<LandingViewState> => ({
		bonusRare: {
			productType: parser.productType,
			productClassId: parser.productClassId,
			totalCoinsForBonus: parser.totalCoinsForBonus,
			coinsStillRequiredToBuy: parser.coinsStillRequiredToBuy,
		},
	}),
};
