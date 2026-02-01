import {createRoot, createSignal} from 'solid-js';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';

// ============================================================================
// Types
// ============================================================================

export interface LocalizationManagers
{
	localization: IHabboLocalizationManager | null;
}

// ============================================================================
// Feature
// ============================================================================

function createLocalizationFeature()
{
	// State
	const [isLoaded, setIsLoaded] = createSignal(false);
	const [languageCode, setLanguageCode] = createSignal('');

	// Manager reference
	let managers: LocalizationManagers = {localization: null};

	// Lifecycle
	function init(mgrs: LocalizationManagers)
	{
		managers = mgrs;

		if (managers.localization)
		{
			// Check if already loaded
			const definition = managers.localization.getActiveLocalizationDefinition();

			if (definition)
			{
				setLanguageCode(definition.languageCode);
				setIsLoaded(true);
			}

			// Listen to events
			managers.localization.on('loaded', () =>
			{
				const activeDef = managers.localization?.getActiveLocalizationDefinition();

				if (activeDef)
				{
					setLanguageCode(activeDef.languageCode);
				}

				setIsLoaded(true);
			});

			managers.localization.on('failed', () =>
			{
				setIsLoaded(false);
			});
		}
	}

	function dispose()
	{
		managers = {localization: null};
		setIsLoaded(false);
		setLanguageCode('');
	}

	// Accessors
	function get(key: string, defaultValue: string = ''): string
	{
		if (!managers.localization) return defaultValue || key;

		return managers.localization.getLocalization(key, defaultValue);
	}

	function getWithParams(key: string, params: Record<string, string>, defaultValue: string = ''): string
	{
		if (!managers.localization) return defaultValue || key;

		// Register parameters
		for (const [paramName, paramValue] of Object.entries(params))
		{
			managers.localization.registerParameter(key, paramName, paramValue);
		}

		return managers.localization.getLocalization(key, defaultValue);
	}

	function getBadgeName(badgeId: string): string
	{
		if (!managers.localization) return badgeId;

		return managers.localization.getBadgeName(badgeId);
	}

	function getBadgeDesc(badgeId: string): string
	{
		if (!managers.localization) return '';

		return managers.localization.getBadgeDesc(badgeId);
	}

	function getAchievementName(badgeId: string): string
	{
		if (!managers.localization) return badgeId;

		return managers.localization.getAchievementName(badgeId);
	}

	function getAchievementDesc(badgeId: string, limit: number): string
	{
		if (!managers.localization) return '';

		return managers.localization.getAchievementDesc(badgeId, limit);
	}

	function has(key: string): boolean
	{
		if (!managers.localization) return false;

		return managers.localization.hasLocalization(key);
	}

	function update(key: string, value: string): void
	{
		managers.localization?.updateLocalization(key, value);
	}

	function setBadgePointLimit(badgeId: string, limit: number): void
	{
		managers.localization?.setBadgePointLimit(badgeId, limit);
	}

	return {
		// State (reactive)
		isLoaded,
		languageCode,

		// Accessors
		get,
		getWithParams,
		getBadgeName,
		getBadgeDesc,
		getAchievementName,
		getAchievementDesc,
		has,
		update,
		setBadgePointLimit,

		// Lifecycle
		init,
		dispose,
	};
}

// Singleton instance
export const localization = createRoot(createLocalizationFeature);
export type Localization = typeof localization;
