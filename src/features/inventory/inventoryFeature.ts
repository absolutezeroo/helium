import {createRoot, createSignal} from 'solid-js';
import {registerMessageEvent} from '@/ui/hooks';
import type {InventoryManagers} from './types';
import type {Badge, Bot, Effect, InventoryCategoryType, Pet} from '@habbo/inventory';
import {FurnitureItem, GroupItem, InventoryCategory, PetFigureData} from '@habbo/inventory';
import {
	BadgesMessageEvent,
	BotInventoryMessageEvent,
	FurniListAddOrUpdateMessageEvent,
	FurniListInvalidateMessageEvent,
	FurniListMessageEvent,
	FurniListRemoveMessageEvent,
	PetInventoryMessageEvent,
} from '@habbo/communication/messages/incoming/inventory';

// Parsers
import type {FurniListMessageParser} from '@habbo/communication/messages/parser/inventory/furni/FurniListMessageParser';
import type {FurniListAddOrUpdateMessageParser} from '@habbo/communication/messages/parser/inventory/furni/FurniListAddOrUpdateMessageParser';
import type {FurniListRemoveMessageParser} from '@habbo/communication/messages/parser/inventory/furni/FurniListRemoveMessageParser';
import type {BadgesMessageParser} from '@habbo/communication/messages/parser/inventory/badges/BadgesMessageParser';
import type {PetInventoryMessageParser} from '@habbo/communication/messages/parser/inventory/pets/PetInventoryMessageParser';
import type {BotInventoryMessageParser} from '@habbo/communication/messages/parser/inventory/bots/BotInventoryMessageParser';

/**
 * Inventory Feature
 *
 * Manages the user's inventory including furniture, badges, effects,
 * pets, and bots. Handles category switching, selection, and unseen counts.
 *
 * @example
 * ```typescript
 * import { inventory } from '@/features';
 *
 * // Open/close inventory
 * inventory.open();
 * inventory.toggle();
 *
 * // Switch category
 * inventory.switchCategory(InventoryCategory.BADGES);
 *
 * // Select items
 * inventory.selectFurniGroup(group);
 * inventory.selectBadge(badge);
 *
 * // Badge wearing
 * inventory.toggleBadgeWearing('ADM');
 *
 * // Effects
 * inventory.useEffect(123);
 * inventory.stopUsingEffect(123);
 * ```
 */
function createInventoryFeature()
{
	// ========== UI State ==========
	const [isOpen, setIsOpen] = createSignal(false);
	const [currentCategory, setCurrentCategory] = createSignal<InventoryCategoryType>(InventoryCategory.FURNI);
	const [isLoading, setIsLoading] = createSignal(false);

	// ========== Furniture State ==========
	const [furniGroups, setFurniGroups] = createSignal<GroupItem[]>([]);
	const [selectedFurniGroup, setSelectedFurniGroup] = createSignal<GroupItem | null>(null);
	const [furniUnseenCount, setFurniUnseenCount] = createSignal(0);

	// ========== Badges State ==========
	const [badges, setBadges] = createSignal<Badge[]>([]);
	const [activeBadges, setActiveBadges] = createSignal<Badge[]>([]);
	const [selectedBadge, setSelectedBadge] = createSignal<Badge | null>(null);
	const [badgesUnseenCount, setBadgesUnseenCount] = createSignal(0);

	// ========== Effects State ==========
	const [effects, setEffects] = createSignal<Effect[]>([]);
	const [selectedEffect, setSelectedEffect] = createSignal<Effect | null>(null);

	// ========== Pets State ==========
	const [pets, setPets] = createSignal<Pet[]>([]);
	const [selectedPet, setSelectedPet] = createSignal<Pet | null>(null);
	const [petsUnseenCount, setPetsUnseenCount] = createSignal(0);

	// ========== Bots State ==========
	const [bots, setBots] = createSignal<Bot[]>([]);
	const [selectedBot, setSelectedBot] = createSignal<Bot | null>(null);
	const [botsUnseenCount, setBotsUnseenCount] = createSignal(0);

	// ========== Manager Reference ==========
	let managers: InventoryManagers = {inventory: null};

	// ========== Cleanup ==========
	const cleanups: (() => void)[] = [];

	// ========== Internal Helpers ==========

	function updateUnseenCounts(): void
	{
		if (!managers.inventory) return;

		const tracker = managers.inventory.unseenItemTracker;

		setFurniUnseenCount(tracker.getCount(1) + tracker.getCount(2));
		setBadgesUnseenCount(tracker.getCount(4));
		setPetsUnseenCount(tracker.getCount(3));
		setBotsUnseenCount(tracker.getCount(5));
	}

	function resetUnseenForCategory(category: InventoryCategoryType): void
	{
		if (!managers.inventory) return;

		switch (category)
		{
			case InventoryCategory.FURNI:
				managers.inventory.unseenItemTracker.resetCategory(1);
				break;
			case InventoryCategory.RENTABLES:
				managers.inventory.unseenItemTracker.resetCategory(2);
				break;
			case InventoryCategory.PETS:
				managers.inventory.unseenItemTracker.resetCategory(3);
				break;
			case InventoryCategory.BADGES:
				managers.inventory.unseenItemTracker.resetCategory(4);
				break;
			case InventoryCategory.BOTS:
				managers.inventory.unseenItemTracker.resetCategory(5);
				break;
		}

		updateUnseenCounts();
	}

	// ========== Lifecycle ==========

	function init(mgrs: InventoryManagers): void
	{
		managers = mgrs;

		if (managers.inventory && !managers.inventory.isInitialized)
		{
			managers.inventory.init();
		}

		// Furni list received
		cleanups.push(
			registerMessageEvent(FurniListMessageEvent, (_, parser) =>
			{
				const p = parser as FurniListMessageParser;
				const inv = managers.inventory;
				if (!inv) return;

				if (p.totalFragments === 1 || p.fragmentNo === p.totalFragments - 1)
				{
					const furnitureItems = new Map<number, import('@habbo/inventory').FurnitureItemData>();

					for (const [id, itemParser] of p.items)
					{
						furnitureItems.set(id, itemParser.toFurnitureItemData());
					}

					inv.furniModel.insertFurniture(furnitureItems);
					inv.setCategoryInitialized(InventoryCategory.FURNI);
					inv.setCategoryInitialized(InventoryCategory.RENTABLES);

					setFurniGroups([...inv.furniModel.furniData]);
					setSelectedFurniGroup(inv.furniModel.getSelectedItem());
					updateUnseenCounts();
					setIsLoading(false);
				}
			})
		);

		// Furni added or updated
		cleanups.push(
			registerMessageEvent(FurniListAddOrUpdateMessageEvent, (_, parser) =>
			{
				const p = parser as FurniListAddOrUpdateMessageParser;
				const inv = managers.inventory;
				if (!inv) return;

				for (const itemParser of p.items)
				{
					const item = new FurnitureItem(itemParser.toFurnitureItemData());
					inv.furniModel.addOrUpdateItem(item, false);
				}

				setFurniGroups([...inv.furniModel.furniData]);
				updateUnseenCounts();
			})
		);

		// Furni removed
		cleanups.push(
			registerMessageEvent(FurniListRemoveMessageEvent, (_, parser) =>
			{
				const p = parser as FurniListRemoveMessageParser;
				const inv = managers.inventory;
				if (!inv) return;

				inv.furniModel.removeFurni(p.itemId);
				setFurniGroups([...inv.furniModel.furniData]);
				setSelectedFurniGroup(inv.furniModel.getSelectedItem());
			})
		);

		// Furni invalidated
		cleanups.push(
			registerMessageEvent(FurniListInvalidateMessageEvent, () =>
			{
				const inv = managers.inventory;
				if (!inv) return;

				inv.furniModel.clearFurniList();
				setFurniGroups([]);
				setSelectedFurniGroup(null);
				setIsLoading(true);
			})
		);

		// Badges received
		cleanups.push(
			registerMessageEvent(BadgesMessageEvent, (_, parser) =>
			{
				const p = parser as BadgesMessageParser;
				const inv = managers.inventory;
				if (!inv) return;

				const badgeDataForModel = p.badges.map(b => ({
					badgeId: b.badgeId,
					slotId: p.activeBadgeIds.includes(b.badgeId) ? (p.activeBadgeIds.indexOf(b.badgeId) + 1) : 0,
				}));

				inv.badgesModel.initBadges(
					badgeDataForModel,
					(id) => id,
					(id) => `Badge: ${id}`
				);

				inv.setCategoryInitialized(InventoryCategory.BADGES);

				setBadges([...inv.badgesModel.getBadges()]);
				setActiveBadges([...inv.badgesModel.getBadges(1)]);
				setSelectedBadge(inv.badgesModel.getSelectedBadge());
				updateUnseenCounts();
				setIsLoading(false);
			})
		);

		// Pets received
		cleanups.push(
			registerMessageEvent(PetInventoryMessageEvent, (_, parser) =>
			{
				const p = parser as PetInventoryMessageParser;
				const inv = managers.inventory;
				if (!inv) return;

				const {Pet} = require('@habbo/inventory');
				const petsMap = new Map<number, Pet>();

				for (const petData of p.pets)
				{
					const figureData = new PetFigureData(
						petData.figureData.typeId,
						petData.figureData.paletteId,
						petData.figureData.color,
						0,
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

				inv.petsModel.updatePets(petsMap);
				inv.setCategoryInitialized(InventoryCategory.PETS);

				setPets([...inv.petsModel.getPetsArray()]);
				setSelectedPet(inv.petsModel.getSelectedPet());
				updateUnseenCounts();
				setIsLoading(false);
			})
		);

		// Bots received
		cleanups.push(
			registerMessageEvent(BotInventoryMessageEvent, (_, parser) =>
			{
				const p = parser as BotInventoryMessageParser;
				const inv = managers.inventory;
				if (!inv) return;

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

				inv.botsModel.updateBots(botsMap);
				inv.setCategoryInitialized(InventoryCategory.BOTS);

				setBots([...inv.botsModel.getBotsArray()]);
				setSelectedBot(inv.botsModel.getSelectedBot());
				updateUnseenCounts();
				setIsLoading(false);
			})
		);
	}

	function dispose(): void
	{
		cleanups.forEach(fn => fn());
		cleanups.length = 0;
		managers = {inventory: null};
	}

	// ========== UI Actions ==========

	function open(category?: InventoryCategoryType): void
	{
		setIsOpen(true);

		if (category)
		{
			switchCategory(category);
		}
		else if (!managers.inventory?.isCategoryInitialized(InventoryCategory.FURNI))
		{
			setIsLoading(true);
			managers.inventory?.requestFurni();
		}
	}

	function close(): void
	{
		resetUnseenForCategory(currentCategory());
		setIsOpen(false);
	}

	function toggle(): void
	{
		isOpen() ? close() : open();
	}

	function switchCategory(category: InventoryCategoryType): void
	{
		resetUnseenForCategory(currentCategory());
		setCurrentCategory(category);
		managers.inventory?.switchCategory(category);

		const inv = managers.inventory;
		if (!inv) return;

		switch (category)
		{
			case InventoryCategory.FURNI:
			case InventoryCategory.RENTABLES:
				if (!inv.isCategoryInitialized(category))
				{
					setIsLoading(true);
					inv.requestFurni();
				}
				else
				{
					setFurniGroups([...inv.furniModel.furniData]);
					setSelectedFurniGroup(inv.furniModel.getSelectedItem());
				}
				break;

			case InventoryCategory.BADGES:
				if (!inv.isCategoryInitialized(category))
				{
					setIsLoading(true);
					inv.requestBadges();
				}
				else
				{
					setBadges([...inv.badgesModel.getBadges()]);
					setActiveBadges([...inv.badgesModel.getBadges(1)]);
					setSelectedBadge(inv.badgesModel.getSelectedBadge());
				}
				break;

			case InventoryCategory.EFFECTS:
				setEffects([...inv.effectsModel.getEffects()]);
				setSelectedEffect(inv.effectsModel.getSelectedEffect());
				break;

			case InventoryCategory.PETS:
				if (!inv.isCategoryInitialized(category))
				{
					setIsLoading(true);
					inv.requestPets();
				}
				else
				{
					setPets([...inv.petsModel.getPetsArray()]);
					setSelectedPet(inv.petsModel.getSelectedPet());
				}
				break;

			case InventoryCategory.BOTS:
				if (!inv.isCategoryInitialized(category))
				{
					setIsLoading(true);
					inv.requestBots();
				}
				else
				{
					setBots([...inv.botsModel.getBotsArray()]);
					setSelectedBot(inv.botsModel.getSelectedBot());
				}
				break;
		}
	}

	// ========== Furni Actions ==========

	function selectFurniGroup(group: GroupItem): void
	{
		managers.inventory?.furniModel.selectItem(group);
		setSelectedFurniGroup(group);
	}

	// ========== Badge Actions ==========

	function selectBadge(badge: Badge): void
	{
		managers.inventory?.badgesModel.setBadgeSelected(badge.badgeId);
		setSelectedBadge(badge);
	}

	function toggleBadgeWearing(badgeId: string): void
	{
		const result = managers.inventory?.badgesModel.toggleBadgeWearing(badgeId);

		if (result && managers.inventory)
		{
			setBadges([...managers.inventory.badgesModel.getBadges()]);
			setActiveBadges([...managers.inventory.badgesModel.getBadges(1)]);
			setSelectedBadge(managers.inventory.badgesModel.getSelectedBadge());
		}
	}

	// ========== Effect Actions ==========

	function selectEffect(effect: Effect): void
	{
		managers.inventory?.effectsModel.setEffectSelected(effect.type);
		setSelectedEffect(effect);
	}

	function useEffect(type: number): void
	{
		managers.inventory?.effectsModel.useEffect(type);

		if (managers.inventory)
		{
			setEffects([...managers.inventory.effectsModel.getEffects()]);
			setSelectedEffect(managers.inventory.effectsModel.getSelectedEffect());
		}
	}

	function stopUsingEffect(type: number): void
	{
		managers.inventory?.effectsModel.stopUsingEffect(type);

		if (managers.inventory)
		{
			setEffects([...managers.inventory.effectsModel.getEffects()]);
			setSelectedEffect(managers.inventory.effectsModel.getSelectedEffect());
		}
	}

	// ========== Pet Actions ==========

	function selectPet(pet: Pet): void
	{
		managers.inventory?.petsModel.selectPet(pet.id);
		setSelectedPet(pet);
	}

	// ========== Bot Actions ==========

	function selectBot(bot: Bot): void
	{
		managers.inventory?.botsModel.selectBot(bot.id);
		setSelectedBot(bot);
	}

	// ========== Public API ==========
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

		// UI Actions
		open,
		close,
		toggle,
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

		// Lifecycle
		init,
		dispose,
	};
}

// ========== Singleton Export ==========
export const inventory = createRoot(createInventoryFeature);
export type Inventory = typeof inventory;
