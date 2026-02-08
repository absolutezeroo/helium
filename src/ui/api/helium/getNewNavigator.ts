import type {IHabboNewNavigator} from '@habbo/navigator/IHabboNewNavigator';
import {getHelium} from './getHelium';

/**
 * @see source_nitro_react/src/api/nitro/
 */
export const getNewNavigator = (): IHabboNewNavigator => getHelium().newNavigator;
