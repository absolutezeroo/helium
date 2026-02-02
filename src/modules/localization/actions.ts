import type {ActionContext} from '../core/types';
import type {LocalizationState} from './types';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';

/**
 * Localization manager dependencies
 */
export interface LocalizationManagers
{
	localization: IHabboLocalizationManager;
}

export function createActions(ctx: ActionContext<LocalizationState, LocalizationManagers>)
{
	const {managers} = ctx;

	return {
		/**
		 * Get a localized string
		 */
		get: (key: string, defaultValue: string = ''): string =>
		{
			return managers.localization.getLocalization(key, defaultValue);
		},

		/**
		 * Get a localized string with parameter substitution
		 */
		getWithParams: (key: string, params: Record<string, string>, defaultValue: string = ''): string =>
		{
			// Register parameters
			for (const [paramName, paramValue] of Object.entries(params))
			{
				managers.localization.registerParameter(key, paramName, paramValue);
			}

			return managers.localization.getLocalization(key, defaultValue);
		},

		/**
		 * Get badge display name
		 */
		getBadgeName: (badgeId: string): string =>
		{
			return managers.localization.getBadgeName(badgeId);
		},

		/**
		 * Get badge description
		 */
		getBadgeDesc: (badgeId: string): string =>
		{
			return managers.localization.getBadgeDesc(badgeId);
		},

		/**
		 * Get achievement display name
		 */
		getAchievementName: (badgeId: string): string =>
		{
			return managers.localization.getAchievementName(badgeId);
		},

		/**
		 * Get achievement description with level limit
		 */
		getAchievementDesc: (badgeId: string, limit: number): string =>
		{
			return managers.localization.getAchievementDesc(badgeId, limit);
		},

		/**
		 * Check if a localization key exists
		 */
		has: (key: string): boolean =>
		{
			return managers.localization.hasLocalization(key);
		},

		/**
		 * Update a localization value at runtime
		 */
		update: (key: string, value: string): void =>
		{
			managers.localization.updateLocalization(key, value);
		},

		/**
		 * Set badge point limit for achievement descriptions
		 */
		setBadgePointLimit: (badgeId: string, limit: number): void =>
		{
			managers.localization.setBadgePointLimit(badgeId, limit);
		},
	};
}

export type LocalizationActions = ReturnType<typeof createActions>;
