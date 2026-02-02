import type {Badge, Bot, Effect, InventoryCategoryType, Pet, GroupItem} from '@habbo/inventory';

/**
 * Inventory module state
 */
export interface InventoryState
{
	// ========== UI State ==========

	/** Whether the inventory window is open */
	isOpen: boolean;

	/** Current category being viewed */
	currentCategory: InventoryCategoryType;

	/** Whether data is currently loading */
	isLoading: boolean;

	// ========== Furniture State ==========

	/** Furniture groups */
	furniGroups: GroupItem[];

	/** Selected furniture group */
	selectedFurniGroup: GroupItem | null;

	/** Unseen furniture count */
	furniUnseenCount: number;

	// ========== Badges State ==========

	/** All badges */
	badges: Badge[];

	/** Active/wearing badges */
	activeBadges: Badge[];

	/** Selected badge */
	selectedBadge: Badge | null;

	/** Unseen badges count */
	badgesUnseenCount: number;

	// ========== Effects State ==========

	/** All effects */
	effects: Effect[];

	/** Selected effect */
	selectedEffect: Effect | null;

	// ========== Pets State ==========

	/** All pets */
	pets: Pet[];

	/** Selected pet */
	selectedPet: Pet | null;

	/** Unseen pets count */
	petsUnseenCount: number;

	// ========== Bots State ==========

	/** All bots */
	bots: Bot[];

	/** Selected bot */
	selectedBot: Bot | null;

	/** Unseen bots count */
	botsUnseenCount: number;
}
