import {createRoot, createSignal} from 'solid-js';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';

function createLocalizationStore()
{
	const [isLoaded, setIsLoaded] = createSignal(false);
	const [languageCode, setLanguageCode] = createSignal('');

	let _manager: IHabboLocalizationManager | null = null;

	return {
		// State
		isLoaded,
		languageCode,

		// Connect to localization manager
		connect: (manager: IHabboLocalizationManager) =>
		{
			_manager = manager;

			// Check if already loaded
			const definition = manager.getActiveLocalizationDefinition();

			if (definition)
			{
				setLanguageCode(definition.languageCode);
				setIsLoaded(true);
			}

			// Listen to loaded event
			manager.on('loaded', () =>
			{
				const activeDef = manager.getActiveLocalizationDefinition();

				if (activeDef)
				{
					setLanguageCode(activeDef.languageCode);
				}

				setIsLoaded(true);
			});

			// Listen to failed event
			manager.on('failed', () =>
			{
				setIsLoaded(false);
			});
		},

		// Get a localized string
		get: (key: string, defaultValue: string = ''): string =>
		{
			if (!_manager) return defaultValue || key;

			return _manager.getLocalization(key, defaultValue);
		},

		// Get localization with parameters
		getWithParams: (key: string, params: Record<string, string>, defaultValue: string = ''): string =>
		{
			if (!_manager) return defaultValue || key;

			// Register parameters
			for (const [paramName, paramValue] of Object.entries(params))
			{
				_manager.registerParameter(key, paramName, paramValue);
			}

			return _manager.getLocalization(key, defaultValue);
		},

		// Get badge name
		getBadgeName: (badgeId: string): string =>
		{
			if (!_manager) return badgeId;

			return _manager.getBadgeName(badgeId);
		},

		// Get badge description
		getBadgeDesc: (badgeId: string): string =>
		{
			if (!_manager) return '';

			return _manager.getBadgeDesc(badgeId);
		},

		// Get achievement name
		getAchievementName: (badgeId: string): string =>
		{
			if (!_manager) return badgeId;

			return _manager.getAchievementName(badgeId);
		},

		// Get achievement description
		getAchievementDesc: (badgeId: string, limit: number): string =>
		{
			if (!_manager) return '';

			return _manager.getAchievementDesc(badgeId, limit);
		},

		// Check if localization key exists
		has: (key: string): boolean =>
		{
			if (!_manager) return false;

			return _manager.hasLocalization(key);
		},

		// Update a localization value at runtime
		update: (key: string, value: string): void =>
		{
			if (_manager)
			{
				_manager.updateLocalization(key, value);
			}
		},

		// Set badge point limit (for achievement descriptions)
		setBadgePointLimit: (badgeId: string, limit: number): void =>
		{
			if (_manager)
			{
				_manager.setBadgePointLimit(badgeId, limit);
			}
		},

		// Get the manager (for advanced use)
		getManager: (): IHabboLocalizationManager | null =>
		{
			return _manager;
		},
	};
}

// Create singleton store
export const localizationStore = createRoot(createLocalizationStore);
