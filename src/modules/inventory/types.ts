import type {Badge, Bot, Effect, GroupItem, InventoryCategoryType, Pet} from '@habbo/inventory';

/**
 * Inventory module state
 */
export interface IInventoryState
{
	/** Whether the inventory window is open */
	isOpen: boolean;

	/** Current category being viewed */
	currentCategory: InventoryCategoryType;

	/** Whether data is currently loading */
	isLoading: boolean;

	/** Furniture groups */
	furniGroups: GroupItem[];

	/** Selected furniture group */
	selectedFurniGroup: GroupItem | null;

	/** Unseen furniture count */
	furniUnseenCount: number;

	/** All badges */
	badges: Badge[];

	/** Active/wearing badges */
	activeBadges: Badge[];

	/** Selected badge */
	selectedBadge: Badge | null;

	/** Unseen badges count */
	badgesUnseenCount: number;

	/** All effects */
	effects: Effect[];

	/** Selected effect */
	selectedEffect: Effect | null;

	/** All pets */
	pets: Pet[];

	/** Selected pet */
	selectedPet: Pet | null;

	/** Unseen pets count */
	petsUnseenCount: number;

	/** All bots */
	bots: Bot[];

	/** Selected bot */
	selectedBot: Bot | null;

	/** Unseen bots count */
	botsUnseenCount: number;
}
