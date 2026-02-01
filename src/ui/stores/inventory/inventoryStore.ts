import {createRoot, createSignal} from 'solid-js';
import type {Badge, Bot, Effect, Pet} from '@habbo/inventory';
import {GroupItem, InventoryCategory} from '@habbo/inventory';
import type {InventoryCategoryType} from '@habbo/inventory';
import {
	BadgesMessageEvent,
	BotInventoryMessageEvent,
	FurniListAddOrUpdateMessageEvent,
	FurniListInvalidateMessageEvent,
	FurniListMessageEvent,
	FurniListRemoveMessageEvent,
	PetInventoryMessageEvent,
} from '@habbo/communication/messages/incoming/inventory';
import type {
	FurniListMessageParser,
} from '@habbo/communication/messages/parser/inventory/furni/FurniListMessageParser';
import type {
	FurniListAddOrUpdateMessageParser,
} from '@habbo/communication/messages/parser/inventory/furni/FurniListAddOrUpdateMessageParser';
import type {
	FurniListRemoveMessageParser,
} from '@habbo/communication/messages/parser/inventory/furni/FurniListRemoveMessageParser';
import type {BadgesMessageParser,} from '@habbo/communication/messages/parser/inventory/badges/BadgesMessageParser';
import type {
	PetInventoryMessageParser,
} from '@habbo/communication/messages/parser/inventory/pets/PetInventoryMessageParser';
import type {
	BotInventoryMessageParser,
} from '@habbo/communication/messages/parser/inventory/bots/BotInventoryMessageParser';
import {registerMessageEvent} from '../../hooks';

/**
 * Inventory data update callback type
 * Used by UIBridge to update inventory model when messages arrive
 */
export type InventoryDataCallback = {
	onFurniList: (parser: FurniListMessageParser) => void;
	onFurniAddOrUpdate: (parser: FurniListAddOrUpdateMessageParser) => void;
	onFurniRemove: (itemId: number) => void;
	onFurniInvalidate: () => void;
	onBadges: (parser: BadgesMessageParser) => void;
	onPets: (parser: PetInventoryMessageParser) => void;
	onBots: (parser: BotInventoryMessageParser) => void;
};

/**
 * Inventory store - manages inventory UI and data state
 *
 * This store holds ONLY reactive state and message listeners.
 * Actions that require managers are handled by UIBridge.
 */
function createInventoryStore()
{
	// UI state
	const [isOpen, setIsOpen] = createSignal(false);
	const [currentCategory, setCurrentCategory] = createSignal<InventoryCategoryType>(InventoryCategory.FURNI);
	const [isLoading, setIsLoading] = createSignal(false);

	// Furniture state
	const [furniGroups, setFurniGroups] = createSignal<GroupItem[]>([]);
	const [selectedFurniGroup, setSelectedFurniGroup] = createSignal<GroupItem | null>(null);
	const [furniUnseenCount, setFurniUnseenCount] = createSignal(0);

	// Badges state
	const [badges, setBadges] = createSignal<Badge[]>([]);
	const [activeBadges, setActiveBadges] = createSignal<Badge[]>([]);
	const [selectedBadge, setSelectedBadge] = createSignal<Badge | null>(null);
	const [badgesUnseenCount, setBadgesUnseenCount] = createSignal(0);

	// Effects state
	const [effects, setEffects] = createSignal<Effect[]>([]);
	const [selectedEffect, setSelectedEffect] = createSignal<Effect | null>(null);

	// Pets state
	const [pets, setPets] = createSignal<Pet[]>([]);
	const [selectedPet, setSelectedPet] = createSignal<Pet | null>(null);
	const [petsUnseenCount, setPetsUnseenCount] = createSignal(0);

	// Bots state
	const [bots, setBots] = createSignal<Bot[]>([]);
	const [selectedBot, setSelectedBot] = createSignal<Bot | null>(null);
	const [botsUnseenCount, setBotsUnseenCount] = createSignal(0);

	// Cleanup functions
	const cleanupFunctions: Array<() => void> = [];

	// Data callback (set by UIBridge to handle inventory updates)
	let dataCallback: InventoryDataCallback | null = null;

	/**
	 * Initialize message event listeners
	 */
	function init(): void
	{
		// Furni list received (full inventory)
		cleanupFunctions.push(
			registerMessageEvent(FurniListMessageEvent, (_, parser) =>
			{
				const p = parser as FurniListMessageParser;

				dataCallback?.onFurniList(p);
			})
		);

		// Furni added or updated
		cleanupFunctions.push(
			registerMessageEvent(FurniListAddOrUpdateMessageEvent, (_, parser) =>
			{
				const p = parser as FurniListAddOrUpdateMessageParser;

				dataCallback?.onFurniAddOrUpdate(p);
			})
		);

		// Furni removed
		cleanupFunctions.push(
			registerMessageEvent(FurniListRemoveMessageEvent, (_, parser) =>
			{
				const p = parser as FurniListRemoveMessageParser;

				dataCallback?.onFurniRemove(p.itemId);
			})
		);

		// Furni list invalidated (need to reload)
		cleanupFunctions.push(
			registerMessageEvent(FurniListInvalidateMessageEvent, () =>
			{
				dataCallback?.onFurniInvalidate();
			})
		);

		// Badges received
		cleanupFunctions.push(
			registerMessageEvent(BadgesMessageEvent, (_, parser) =>
			{
				const p = parser as BadgesMessageParser;

				dataCallback?.onBadges(p);
			})
		);

		// Pets received
		cleanupFunctions.push(
			registerMessageEvent(PetInventoryMessageEvent, (_, parser) =>
			{
				const p = parser as PetInventoryMessageParser;

				dataCallback?.onPets(p);
			})
		);

		// Bots received
		cleanupFunctions.push(
			registerMessageEvent(BotInventoryMessageEvent, (_, parser) =>
			{
				const p = parser as BotInventoryMessageParser;

				dataCallback?.onBots(p);
			})
		);
	}

	/**
	 * Cleanup message event listeners
	 */
	function dispose(): void
	{
		for (const cleanup of cleanupFunctions)
		{
			cleanup();
		}

		cleanupFunctions.length = 0;
		dataCallback = null;
	}

	/**
	 * Set data callback (called by UIBridge)
	 */
	function setDataCallback(callback: InventoryDataCallback | null): void
	{
		dataCallback = callback;
	}

	// ========== UI State Setters ==========

	function openInventory(): void
	{
		setIsOpen(true);
	}

	function closeInventory(): void
	{
		setIsOpen(false);
	}

	function toggleInventory(): void
	{
		setIsOpen((prev) => !prev);
	}

	// ========== State Setters (for UIBridge) ==========

	function updateCategory(category: InventoryCategoryType): void
	{
		setCurrentCategory(category);
	}

	function updateLoading(loading: boolean): void
	{
		setIsLoading(loading);
	}

	function updateFurni(groups: GroupItem[], selected: GroupItem | null): void
	{
		setFurniGroups(groups);
		setSelectedFurniGroup(selected);
	}

	function updateBadges(allBadges: Badge[], active: Badge[], selected: Badge | null): void
	{
		setBadges(allBadges);
		setActiveBadges(active);
		setSelectedBadge(selected);
	}

	function updateEffects(allEffects: Effect[], selected: Effect | null): void
	{
		setEffects(allEffects);
		setSelectedEffect(selected);
	}

	function updatePets(allPets: Pet[], selected: Pet | null): void
	{
		setPets(allPets);
		setSelectedPet(selected);
	}

	function updateBots(allBots: Bot[], selected: Bot | null): void
	{
		setBots(allBots);
		setSelectedBot(selected);
	}

	function updateUnseenCounts(furni: number, badges: number, pets: number, bots: number): void
	{
		setFurniUnseenCount(furni);
		setBadgesUnseenCount(badges);
		setPetsUnseenCount(pets);
		setBotsUnseenCount(bots);
	}

	function updateSelectedFurniGroup(group: GroupItem | null): void
	{
		setSelectedFurniGroup(group);
	}

	function updateSelectedBadge(badge: Badge | null): void
	{
		setSelectedBadge(badge);
	}

	function updateSelectedEffect(effect: Effect | null): void
	{
		setSelectedEffect(effect);
	}

	function updateSelectedPet(pet: Pet | null): void
	{
		setSelectedPet(pet);
	}

	function updateSelectedBot(bot: Bot | null): void
	{
		setSelectedBot(bot);
	}

	return {
		// UI State (reactive)
		isOpen,
		currentCategory,
		isLoading,

		// Furni State (reactive)
		furniGroups,
		selectedFurniGroup,
		furniUnseenCount,

		// Badges State (reactive)
		badges,
		activeBadges,
		selectedBadge,
		badgesUnseenCount,

		// Effects State (reactive)
		effects,
		selectedEffect,

		// Pets State (reactive)
		pets,
		selectedPet,
		petsUnseenCount,

		// Bots State (reactive)
		bots,
		selectedBot,
		botsUnseenCount,

		// Lifecycle
		init,
		dispose,
		setDataCallback,

		// UI State Actions (no manager needed)
		openInventory,
		closeInventory,
		toggleInventory,

		// State Setters (for UIBridge)
		updateCategory,
		updateLoading,
		updateFurni,
		updateBadges,
		updateEffects,
		updatePets,
		updateBots,
		updateUnseenCounts,
		updateSelectedFurniGroup,
		updateSelectedBadge,
		updateSelectedEffect,
		updateSelectedPet,
		updateSelectedBot,
	};
}

export const inventoryStore = createRoot(createInventoryStore);
