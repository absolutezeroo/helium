import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import {getHelium} from './getHelium';

/**
 * @see source_nitro_react/src/api/nitro/
 */
export const getNavigator = (): IHabboNavigator => getHelium().navigator;
