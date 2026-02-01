import {createRoot, createSignal} from 'solid-js';
import type {Badge, Bot, Effect, IHabboInventory, InventoryCategoryType, Pet} from '@habbo/inventory';
import {GroupItem, InventoryCategory} from '@habbo/inventory';
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
 * Inventory store - manages inventory UI and data state
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

	// Inventory reference
	let inventory: IHabboInventory | null = null;

	// Cleanup functions
	const cleanupFunctions: Array<() => void> = [];

	/**
	 * Connect to inventory and set up message listeners
	 */
	function connect(inv: IHabboInventory): void
	{
		inventory = inv;

		// Ensure inventory is initialized
		if (!inv.isInitialized)
		{
			inv.init();
		}

		// Furni list received (full inventory)
		cleanupFunctions.push(
			registerMessageEvent(FurniListMessageEvent, (_, parser) =>
			{
				const p = parser as FurniListMessageParser;

				if (p.totalFragments === 1 || p.fragmentNo === p.totalFragments - 1)
				{
					// All fragments received, convert to FurnitureItemData and update model
					const furnitureItems = new Map<number, import('@habbo/inventory').FurnitureItemData>();

					for (const [id, itemParser] of p.items)
					{
						furnitureItems.set(id, itemParser.toFurnitureItemData());
					}

					inventory?.furniModel.insertFurniture(furnitureItems);

					// Mark both furni and rentables as initialized (they share the same data)
					inventory?.setCategoryInitialized(InventoryCategory.FURNI);
					inventory?.setCategoryInitialized(InventoryCategory.RENTABLES);

					setFurniGroups([...inventory?.furniModel.furniData ?? []]);
					setSelectedFurniGroup(inventory?.furniModel.getSelectedItem() ?? null);
					updateUnseenCounts();
					setIsLoading(false);
				}
			})
		);

		// Furni added or updated
		cleanupFunctions.push(
			registerMessageEvent(FurniListAddOrUpdateMessageEvent, (_, parser) =>
			{
				const p = parser as FurniListAddOrUpdateMessageParser;

				for (const itemData of p.items)
				{
					const {FurnitureItem} = require('@habbo/inventory');
					const item = new FurnitureItem(itemData);

					inventory?.furniModel.addOrUpdateItem(item, false);
				}

				setFurniGroups([...inventory?.furniModel.furniData ?? []]);
				updateUnseenCounts();
			})
		);

		// Furni removed
		cleanupFunctions.push(
			registerMessageEvent(FurniListRemoveMessageEvent, (_, parser) =>
			{
				const p = parser as FurniListRemoveMessageParser;

				inventory?.furniModel.removeFurni(p.itemId);

				setFurniGroups([...inventory?.furniModel.furniData ?? []]);

				// Update selection if removed item was selected
				if (selectedFurniGroup()?.getItem(p.itemId))
				{
					setSelectedFurniGroup(inventory?.furniModel.getSelectedItem() ?? null);
				}
			})
		);

		// Furni list invalidated (need to reload)
		cleanupFunctions.push(
			registerMessageEvent(FurniListInvalidateMessageEvent, () =>
			{
				inventory?.furniModel.clearFurniList();

				setFurniGroups([]);
				setSelectedFurniGroup(null);
				setIsLoading(true);
			})
		);

		// Badges received
		cleanupFunctions.push(
			registerMessageEvent(BadgesMessageEvent, (_, parser) =>
			{
				const p = parser as BadgesMessageParser;

				// Initialize badges with placeholder name/desc functions (localization can be added later)
				const badgeDataForModel = p.badges.map(b => ({
					badgeId: b.badgeId,
					slotId: p.activeBadgeIds.includes(b.badgeId) ? (p.activeBadgeIds.indexOf(b.badgeId) + 1) : 0,
				}));

				inventory?.badgesModel.initBadges(
					badgeDataForModel,
					(id) => id, // getName - use ID as placeholder
					(id) => `Badge: ${id}` // getDesc - use placeholder
				);

				// Mark badges as initialized
				inventory?.setCategoryInitialized(InventoryCategory.BADGES);

				setBadges([...inventory?.badgesModel.getBadges() ?? []]);
				setActiveBadges([...inventory?.badgesModel.getBadges(1) ?? []]);
				setSelectedBadge(inventory?.badgesModel.getSelectedBadge() ?? null);
				updateUnseenCounts();
				setIsLoading(false);
			})
		);

		// Pets received
		cleanupFunctions.push(
			registerMessageEvent(PetInventoryMessageEvent, (_, parser) =>
			{
				const p = parser as PetInventoryMessageParser;

				// Convert PetData to Pet objects
				const {Pet, PetFigureData} = require('@habbo/inventory');
				const petsMap = new Map<number, Pet>();

				for (const petData of p.pets)
				{
					const figureData = new PetFigureData(
						petData.figureData.typeId,
						petData.figureData.paletteId,
						petData.figureData.color,
						0, // breedId (not in parser data)
						petData.figureData.customParts.length,
						petData.figureData.customParts
					);

					const pet = new Pet(
						petData.id,
						petData.name,
						figureData,
						petData.level
					);

					petsMap.set(petData.id, pet);
				}

				inventory?.petsModel.updatePets(petsMap);

				// Mark pets as initialized
				inventory?.setCategoryInitialized(InventoryCategory.PETS);

				setPets([...inventory?.petsModel.getPetsArray() ?? []]);
				setSelectedPet(inventory?.petsModel.getSelectedPet() ?? null);
				updateUnseenCounts();
				setIsLoading(false);
			})
		);

		// Bots received
		cleanupFunctions.push(
			registerMessageEvent(BotInventoryMessageEvent, (_, parser) =>
			{
				const p = parser as BotInventoryMessageParser;

				// Convert BotData to Bot objects
				const {Bot} = require('@habbo/inventory');
				const botsMap = new Map<number, Bot>();

				for (const botData of p.bots)
				{
					const bot = new Bot(
						botData.id,
						botData.name,
						botData.motto,
						botData.figure,
						botData.gender
					);

					botsMap.set(botData.id, bot);
				}

				inventory?.botsModel.updateBots(botsMap);

				// Mark bots as initialized
				inventory?.setCategoryInitialized(InventoryCategory.BOTS);

				setBots([...inventory?.botsModel.getBotsArray() ?? []]);
				setSelectedBot(inventory?.botsModel.getSelectedBot() ?? null);
				updateUnseenCounts();
				setIsLoading(false);
			})
		);
	}

	/**
	 * Disconnect and cleanup
	 */
	function disconnect(): void
	{
		for (const cleanup of cleanupFunctions)
		{
			cleanup();
		}

		cleanupFunctions.length = 0;
		inventory = null;
	}

	/**
	 * Update unseen counts from tracker
	 */
	function updateUnseenCounts(): void
	{
		if (!inventory) return;

		const tracker = inventory.unseenItemTracker;

		setFurniUnseenCount(tracker.getCount(1) + tracker.getCount(2));
		setPetsUnseenCount(tracker.getCount(3));
		setBadgesUnseenCount(tracker.getCount(4));
		setBotsUnseenCount(tracker.getCount(5));
	}

	// ========== UI Actions ==========

	function openInventory(category?: InventoryCategoryType): void
	{
		setIsOpen(true);

		if (category)
		{
			switchCategory(category);
		} else
		{
			// Default to furni category and request data
			if (!inventory?.isCategoryInitialized(InventoryCategory.FURNI))
			{
				setIsLoading(true);
				inventory?.requestFurni();
			}
		}
	}

	function closeInventory(): void
	{
		setIsOpen(false);

		// Reset unseen items for current category when closing
		resetUnseenForCategory(currentCategory());
	}

	function toggleInventory(): void
	{
		if (isOpen())
		{
			closeInventory();
		} else
		{
			openInventory();
		}
	}

	function switchCategory(category: InventoryCategoryType): void
	{
		// Reset unseen for previous category
		resetUnseenForCategory(currentCategory());

		setCurrentCategory(category);
		inventory?.switchCategory(category);

		// Request data and update view based on category
		switch (category)
		{
			case InventoryCategory.FURNI:
			case InventoryCategory.RENTABLES:
				if (!inventory?.isCategoryInitialized(category))
				{
					setIsLoading(true);
					inventory?.requestFurni();
				} else
				{
					setFurniGroups([...inventory?.furniModel.furniData ?? []]);
					setSelectedFurniGroup(inventory?.furniModel.getSelectedItem() ?? null);
				}
				break;

			case InventoryCategory.BADGES:
				if (!inventory?.isCategoryInitialized(category))
				{
					setIsLoading(true);
					inventory?.requestBadges();
				} else
				{
					setBadges([...inventory?.badgesModel.getBadges() ?? []]);
					setActiveBadges([...inventory?.badgesModel.getBadges(1) ?? []]);
					setSelectedBadge(inventory?.badgesModel.getSelectedBadge() ?? null);
				}
				break;

			case InventoryCategory.EFFECTS:
				setEffects([...inventory?.effectsModel.getEffects() ?? []]);
				setSelectedEffect(inventory?.effectsModel.getSelectedEffect() ?? null);
				break;

			case InventoryCategory.PETS:
				if (!inventory?.isCategoryInitialized(category))
				{
					setIsLoading(true);
					inventory?.requestPets();
				} else
				{
					setPets([...inventory?.petsModel.getPetsArray() ?? []]);
					setSelectedPet(inventory?.petsModel.getSelectedPet() ?? null);
				}
				break;

			case InventoryCategory.BOTS:
				if (!inventory?.isCategoryInitialized(category))
				{
					setIsLoading(true);
					inventory?.requestBots();
				} else
				{
					setBots([...inventory?.botsModel.getBotsArray() ?? []]);
					setSelectedBot(inventory?.botsModel.getSelectedBot() ?? null);
				}
				break;
		}
	}

	function resetUnseenForCategory(category: InventoryCategoryType): void
	{
		if (!inventory) return;

		switch (category)
		{
			case InventoryCategory.FURNI:
				inventory.unseenItemTracker.resetCategory(1);
				break;

			case InventoryCategory.RENTABLES:
				inventory.unseenItemTracker.resetCategory(2);
				break;

			case InventoryCategory.PETS:
				inventory.unseenItemTracker.resetCategory(3);
				break;

			case InventoryCategory.BADGES:
				inventory.unseenItemTracker.resetCategory(4);
				break;

			case InventoryCategory.BOTS:
				inventory.unseenItemTracker.resetCategory(5);
				break;
		}

		updateUnseenCounts();
	}

	// ========== Furni Actions ==========

	function selectFurniGroup(group: GroupItem): void
	{
		inventory?.furniModel.selectItem(group);

		setSelectedFurniGroup(group);
	}

	// ========== Badge Actions ==========

	function selectBadge(badge: Badge): void
	{
		inventory?.badgesModel.setBadgeSelected(badge.badgeId);

		setSelectedBadge(badge);
	}

	function toggleBadgeWearing(badgeId: string): void
	{
		const result = inventory?.badgesModel.toggleBadgeWearing(badgeId);

		if (result)
		{
			setActiveBadges([...inventory?.badgesModel.getBadges(1) ?? []]);
			setBadges([...inventory?.badgesModel.getBadges() ?? []]);
		}
	}

	// ========== Effect Actions ==========

	function selectEffect(effect: Effect): void
	{
		inventory?.effectsModel.setEffectSelected(effect.type);

		setSelectedEffect(effect);
	}

	function useEffect(type: number): void
	{
		inventory?.effectsModel.useEffect(type);

		setEffects([...inventory?.effectsModel.getEffects() ?? []]);
	}

	function stopUsingEffect(type: number): void
	{
		inventory?.effectsModel.stopUsingEffect(type);

		setEffects([...inventory?.effectsModel.getEffects() ?? []]);
	}

	// ========== Pet Actions ==========

	function selectPet(pet: Pet): void
	{
		inventory?.petsModel.selectPet(pet.id);

		setSelectedPet(pet);
	}

	// ========== Bot Actions ==========

	function selectBot(bot: Bot): void
	{
		inventory?.botsModel.selectBot(bot.id);

		setSelectedBot(bot);
	}

	return {
		// UI State
		isOpen,
		currentCategory,
		isLoading,

		// Furni State
		furniGroups,
		selectedFurniGroup,
		furniUnseenCount,

		// Badges State
		badges,
		activeBadges,
		selectedBadge,
		badgesUnseenCount,

		// Effects State
		effects,
		selectedEffect,

		// Pets State
		pets,
		selectedPet,
		petsUnseenCount,

		// Bots State
		bots,
		selectedBot,
		botsUnseenCount,

		// Connection
		connect,
		disconnect,

		// UI Actions
		openInventory,
		closeInventory,
		toggleInventory,
		switchCategory,

		// Furni Actions
		selectFurniGroup,

		// Badge Actions
		selectBadge,
		toggleBadgeWearing,

		// Effect Actions
		selectEffect,
		useEffect,
		stopUsingEffect,

		// Pet Actions
		selectPet,

		// Bot Actions
		selectBot,
	};
}

export const inventoryStore = createRoot(createInventoryStore);
