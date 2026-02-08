import type {PromoArticleData} from '@habbo/communication/messages/parser/landingview/PromoArticleData';
import type {CommunityGoalHallOfFameData} from '@habbo/communication/messages/parser/quest/CommunityGoalHallOfFameData';

/**
 * Bonus rare info data
 */
export interface BonusRareInfo
{
	productType: string;
	productClassId: number;
	totalCoinsForBonus: number;
	coinsStillRequiredToBuy: number;
}

/**
 * Landing view module state
 */
export interface LandingViewState
{
	/** Promotional articles from the server */
	articles: PromoArticleData[] | null;

	/** Community goal hall of fame data */
	hallOfFame: CommunityGoalHallOfFameData | null;

	/** Bonus rare info from the catalog */
	bonusRare: BonusRareInfo | null;
}
