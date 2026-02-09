import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {getHelium} from './getHelium';

/**
 * @see source_nitro_react/src/api/nitro/
 */
export const getLocalization = (): IHabboLocalizationManager => getHelium().localization;
