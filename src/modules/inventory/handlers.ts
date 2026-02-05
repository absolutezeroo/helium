import type {HandlerContext, MessageHandlers} from '../core/types';
import type {InventoryState} from './types';
import type {InventoryManagers} from './actions';
import {FurnitureItem, InventoryCategory, PetFigureData} from '@habbo/inventory';

// Parser types
import type {FurniListMessageParser} from '@habbo/communication/messages/parser/inventory/furni/FurniListMessageParser';
import type {
	FurniListAddOrUpdateMessageParser
} from '@habbo/communication/messages/parser/inventory/furni/FurniListAddOrUpdateMessageParser';
import type {
	FurniListRemoveMessageParser
} from '@habbo/communication/messages/parser/inventory/furni/FurniListRemoveMessageParser';
import type {BadgesMessageParser} from '@habbo/communication/messages/parser/inventory/badges/BadgesMessageParser';
import type {
	PetInventoryMessageParser
} from '@habbo/communication/messages/parser/inventory/pets/PetInventoryMessageParser';
import type {
	BotInventoryMessageParser
} from '@habbo/communication/messages/parser/inventory/bots/BotInventoryMessageParser';

type Ctx = HandlerContext<InventoryState, InventoryManagers>;

export const handlers: MessageHandlers<InventoryState, InventoryManagers> = {

	/**
	 * Furniture list received (fragmented)
	 */
	FurniListMessageEvent: (parser: FurniListMessageParser, _state, {managers, updateState}: Ctx) =>
	{
		// Only process when all fragments are received
		if (parser.totalFragments !== 1 && parser.fragmentNo !== parser.totalFragments - 1)
		{
			return;
		}

		const inv = managers.inventory;
		const furnitureItems = new Map<number, import('@habbo/inventory').FurnitureItemData>();

		for (const [id, itemParser] of parser.items)
		{
			furnitureItems.set(id, itemParser.toFurnitureItemData());
		}

		inv.furniModel.insertFurniture(furnitureItems);
		inv.setCategoryInitialized(InventoryCategory.FURNI);
		inv.setCategoryInitialized(InventoryCategory.RENTABLES);

		updateState({
			furniGroups: [...inv.furniModel.furniData],
			selectedFurniGroup: inv.furniModel.getSelectedItem(),
			isLoading: false,
			furniUnseenCount: inv.unseenItemTracker.getCount(1) + inv.unseenItemTracker.getCount(2),
		});
	},

	/**
	 * Furniture added or updated
	 */
	FurniListAddOrUpdateMessageEvent: (parser: FurniListAddOrUpdateMessageParser, _state, {
		managers,
		updateState
	}: Ctx) =>
	{
		const inv = managers.inventory;

		for (const itemParser of parser.items)
		{
			const item = new FurnitureItem(itemParser.toFurnitureItemData());

			inv.furniModel.addOrUpdateItem(item, false);
		}

		updateState({
			furniGroups: [...inv.furniModel.furniData],
			furniUnseenCount: inv.unseenItemTracker.getCount(1) + inv.unseenItemTracker.getCount(2),
		});
	},

	/**
	 * Furniture removed
	 */
	FurniListRemoveMessageEvent: (parser: FurniListRemoveMessageParser, _state, {managers, updateState}: Ctx) =>
	{
		const inv = managers.inventory;

		inv.furniModel.removeFurni(parser.itemId);

		updateState({
			furniGroups: [...inv.furniModel.furniData],
			selectedFurniGroup: inv.furniModel.getSelectedItem(),
		});
	},

	/**
	 * Furniture invalidated - need to reload
	 */
	FurniListInvalidateMessageEvent: (_parser, _state, {managers, updateState}: Ctx) =>
	{
		managers.inventory.furniModel.clearFurniList();

		updateState({
			furniGroups: [],
			selectedFurniGroup: null,
			isLoading: true,
		});
	},

	/**
	 * Badges list received
	 */
	BadgesMessageEvent: (parser: BadgesMessageParser, _state, {managers, updateState}: Ctx) =>
	{
		const inv = managers.inventory;

		const badgeDataForModel = parser.badges.map(b => ({
			badgeId: b.badgeId,
			slotId: parser.activeBadgeIds.includes(b.badgeId)
				? (parser.activeBadgeIds.indexOf(b.badgeId) + 1)
				: 0,
		}));

		inv.badgesModel.initBadges(
			badgeDataForModel,
			(id) => id,
			(id) => `Badge: ${id}`
		);

		inv.setCategoryInitialized(InventoryCategory.BADGES);

		updateState({
			badges: [...inv.badgesModel.getBadges()],
			activeBadges: [...inv.badgesModel.getBadges(1)],
			selectedBadge: inv.badgesModel.getSelectedBadge(),
			badgesUnseenCount: inv.unseenItemTracker.getCount(4),
			isLoading: false,
		});
	},

	/**
	 * Pets list received
	 */
	PetInventoryMessageEvent: (parser: PetInventoryMessageParser, _state, {managers, updateState}: Ctx) =>
	{
		const inv = managers.inventory;
		const {Pet} = require('@habbo/inventory');
		const petsMap = new Map();

		for (const petData of parser.pets)
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

		updateState({
			pets: [...inv.petsModel.getPetsArray()],
			selectedPet: inv.petsModel.getSelectedPet(),
			petsUnseenCount: inv.unseenItemTracker.getCount(3),
			isLoading: false,
		});
	},

	/**
	 * Bots list received
	 */
	BotInventoryMessageEvent: (parser: BotInventoryMessageParser, _state, {managers, updateState}: Ctx) =>
	{
		const inv = managers.inventory;
		const {Bot} = require('@habbo/inventory');
		const botsMap = new Map();

		for (const botData of parser.bots)
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

		updateState({
			bots: [...inv.botsModel.getBotsArray()],
			selectedBot: inv.botsModel.getSelectedBot(),
			botsUnseenCount: inv.unseenItemTracker.getCount(5),
			isLoading: false,
		});
	},
};
