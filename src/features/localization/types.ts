import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';

/**
 * Manager dependencies for the localization feature
 */
export interface LocalizationManagers
{
	localization: IHabboLocalizationManager | null;
}
