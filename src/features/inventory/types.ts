import type {IHabboInventory} from '@habbo/inventory';

/**
 * Manager dependencies for the inventory feature
 */
export interface InventoryManagers
{
	inventory: IHabboInventory | null;
}
