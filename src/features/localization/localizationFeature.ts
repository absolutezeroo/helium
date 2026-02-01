import {createRoot, createSignal} from 'solid-js';
import type {LocalizationManagers} from './types';

/**
 * Localization Feature
 *
 * Provides access to translated strings from external_texts.txt.
 * Supports parameter substitution and special badge/achievement lookups.
 *
 * @example
 * ```typescript
 * import { localization } from '@/features';
 *
 * // Simple text lookup
 * const title = localization.get('navigator.title', 'Navigator');
 *
 * // With parameter substitution
 * const welcome = localization.getWithParams('welcome.user', { name: 'John' });
 *
 * // Badge names
 * const badgeName = localization.getBadgeName('ADM');
 * ```
 */
function createLocalizationFeature()
{
	// ========== State ==========
	const [isLoaded, setIsLoaded] = createSignal(false);
	const [languageCode, setLanguageCode] = createSignal('');

	// ========== Manager Reference ==========
	let managers: LocalizationManagers = {localization: null};

	// ========== Lifecycle ==========

	function init(mgrs: LocalizationManagers): void
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

	function dispose(): void
	{
		managers = {localization: null};
		setIsLoaded(false);
		setLanguageCode('');
	}

	// ========== Accessors ==========

	/**
	 * Get a localized string
	 */
	function get(key: string, defaultValue: string = ''): string
	{
		if (!managers.localization) return defaultValue || key;

		return managers.localization.getLocalization(key, defaultValue);
	}

	/**
	 * Get a localized string with parameter substitution
	 */
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

	/**
	 * Get badge display name
	 */
	function getBadgeName(badgeId: string): string
	{
		if (!managers.localization) return badgeId;

		return managers.localization.getBadgeName(badgeId);
	}

	/**
	 * Get badge description
	 */
	function getBadgeDesc(badgeId: string): string
	{
		if (!managers.localization) return '';

		return managers.localization.getBadgeDesc(badgeId);
	}

	/**
	 * Get achievement display name
	 */
	function getAchievementName(badgeId: string): string
	{
		if (!managers.localization) return badgeId;

		return managers.localization.getAchievementName(badgeId);
	}

	/**
	 * Get achievement description with level limit
	 */
	function getAchievementDesc(badgeId: string, limit: number): string
	{
		if (!managers.localization) return '';

		return managers.localization.getAchievementDesc(badgeId, limit);
	}

	/**
	 * Check if a localization key exists
	 */
	function has(key: string): boolean
	{
		if (!managers.localization) return false;

		return managers.localization.hasLocalization(key);
	}

	/**
	 * Update a localization value at runtime
	 */
	function update(key: string, value: string): void
	{
		managers.localization?.updateLocalization(key, value);
	}

	/**
	 * Set badge point limit for achievement descriptions
	 */
	function setBadgePointLimit(badgeId: string, limit: number): void
	{
		managers.localization?.setBadgePointLimit(badgeId, limit);
	}

	// ========== Public API ==========
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

// ========== Singleton Export ==========
export const localization = createRoot(createLocalizationFeature);
export type Localization = typeof localization;
