import {IID_HabboInventory} from '@iid/IIDHabboInventory';
import {InventoryCategory} from '@habbo/inventory';
import {defineModule} from '../core/defineModule';
import type {IInventoryState} from './types';
import type {InventoryActions, IInventoryManagers} from './actions';
import {createActions} from './actions';
import {handlers} from './handlers';

/**
 * Inventory Module
 *
 * Manages the user's inventory including furniture, badges, effects,
 * pets, and bots. Handles category switching, selection, and unseen counts.
 *
 * @example
 * ```typescript
 * const { state, actions } = useModule(ModuleId.Inventory);
 *
 * // Open/close inventory
 * actions.open();
 * actions.toggle();
 *
 * // Switch category
 * actions.switchCategory(InventoryCategory.BADGES);
 *
 * // Select items
 * actions.selectFurniGroup(group);
 * actions.selectBadge(badge);
 * ```
 */
export const inventoryModule = defineModule({
	id: 'inventory',

	depends: [],

	managerIIDs: {
		inventory: IID_HabboInventory,
	} satisfies Record<keyof IInventoryManagers, unknown>,

	initialState: {
		// UI State
		isOpen: false,
		currentCategory: InventoryCategory.FURNI,
		isLoading: false,

		// Furniture
		furniGroups: [],
		selectedFurniGroup: null,
		furniUnseenCount: 0,

		// Badges
		badges: [],
		activeBadges: [],
		selectedBadge: null,
		badgesUnseenCount: 0,

		// Effects
		effects: [],
		selectedEffect: null,

		// Pets
		pets: [],
		selectedPet: null,
		petsUnseenCount: 0,

		// Bots
		bots: [],
		selectedBot: null,
		botsUnseenCount: 0,
	} satisfies IInventoryState,

	handlers,
	actions: createActions,

	onInit: ({managers}) =>
	{
		const inv = managers.inventory;

		// Initialize inventory if not already
		if (!inv.isInitialized)
		{
			inv.init();
		}
	},
});

export type {IInventoryState} from './types';
export type {InventoryActions, IInventoryManagers} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds'
{
	interface IModuleStateMap
	{
		'inventory': IInventoryState;
	}

	interface IModuleActionsMap
	{
		'inventory': InventoryActions;
	}
}
