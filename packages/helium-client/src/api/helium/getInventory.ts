import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import {getHelium} from './getHelium';

/**
 * @see source_nitro_react/src/api/nitro/
 */
export const getInventory = (): IHabboInventory => getHelium().inventory;
