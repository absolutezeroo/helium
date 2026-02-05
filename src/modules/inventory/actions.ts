import type {ActionContext} from '../core/types';
import type {InventoryState} from './types';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {Badge, Bot, Effect, GroupItem, InventoryCategoryType, Pet} from '@habbo/inventory';
import {InventoryCategory} from '@habbo/inventory';

/**
 * Inventory manager dependencies
 */
export interface InventoryManagers
{
	inventory: IHabboInventory;
}

export function createActions(ctx: ActionContext<InventoryState, InventoryManagers>)
{
	const {getState, updateState, managers} = ctx;

	function updateUnseenCounts(): void
	{
		const tracker = managers.inventory.unseenItemTracker;

		updateState({
			furniUnseenCount: tracker.getCount(1) + tracker.getCount(2),
			badgesUnseenCount: tracker.getCount(4),
			petsUnseenCount: tracker.getCount(3),
			botsUnseenCount: tracker.getCount(5),
		});
	}

	function resetUnseenForCategory(category: InventoryCategoryType): void
	{
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

	return {
		/**
		 * Open inventory
		 */
		open: (category?: InventoryCategoryType): void =>
		{
			updateState({isOpen: true});

			if (category)
			{
				// Use switchCategory action
				const actions = createActions(ctx);

				actions.switchCategory(category);
			} else if (!managers.inventory.isCategoryInitialized(InventoryCategory.FURNI))
			{
				updateState({isLoading: true});
				managers.inventory.requestFurni();
			}
		},

		/**
		 * Close inventory
		 */
		close: (): void =>
		{
			resetUnseenForCategory(getState().currentCategory);
			updateState({isOpen: false});
		},

		/**
		 * Toggle inventory
		 */
		toggle: (): void =>
		{
			const state = getState();

			if (state.isOpen)
			{
				resetUnseenForCategory(state.currentCategory);
				updateState({isOpen: false});
			} else
			{
				updateState({isOpen: true});

				if (!managers.inventory.isCategoryInitialized(InventoryCategory.FURNI))
				{
					updateState({isLoading: true});
					managers.inventory.requestFurni();
				}
			}
		},

		/**
		 * Switch category
		 */
		switchCategory: (category: InventoryCategoryType): void =>
		{
			resetUnseenForCategory(getState().currentCategory);
			updateState({currentCategory: category});
			managers.inventory.switchCategory(category);

			const inv = managers.inventory;

			switch (category)
			{
				case InventoryCategory.FURNI:
				case InventoryCategory.RENTABLES:
					if (!inv.isCategoryInitialized(category))
					{
						updateState({isLoading: true});
						inv.requestFurni();
					} else
					{
						updateState({
							furniGroups: [...inv.furniModel.furniData],
							selectedFurniGroup: inv.furniModel.getSelectedItem(),
						});
					}
					break;

				case InventoryCategory.BADGES:
					if (!inv.isCategoryInitialized(category))
					{
						updateState({isLoading: true});
						inv.requestBadges();
					} else
					{
						updateState({
							badges: [...inv.badgesModel.getBadges()],
							activeBadges: [...inv.badgesModel.getBadges(1)],
							selectedBadge: inv.badgesModel.getSelectedBadge(),
						});
					}
					break;

				case InventoryCategory.EFFECTS:
					updateState({
						effects: [...inv.effectsModel.getEffects()],
						selectedEffect: inv.effectsModel.getSelectedEffect(),
					});
					break;

				case InventoryCategory.PETS:
					if (!inv.isCategoryInitialized(category))
					{
						updateState({isLoading: true});
						inv.requestPets();
					} else
					{
						updateState({
							pets: [...inv.petsModel.getPetsArray()],
							selectedPet: inv.petsModel.getSelectedPet(),
						});
					}
					break;

				case InventoryCategory.BOTS:
					if (!inv.isCategoryInitialized(category))
					{
						updateState({isLoading: true});
						inv.requestBots();
					} else
					{
						updateState({
							bots: [...inv.botsModel.getBotsArray()],
							selectedBot: inv.botsModel.getSelectedBot(),
						});
					}
					break;
			}
		},

		/**
		 * Select a furniture group
		 */
		selectFurniGroup: (group: GroupItem): void =>
		{
			managers.inventory.furniModel.selectItem(group);
			updateState({selectedFurniGroup: group});
		},

		/**
		 * Select a badge
		 */
		selectBadge: (badge: Badge): void =>
		{
			managers.inventory.badgesModel.setBadgeSelected(badge.badgeId);
			updateState({selectedBadge: badge});
		},

		/**
		 * Toggle badge wearing
		 */
		toggleBadgeWearing: (badgeId: string): void =>
		{
			const result = managers.inventory.badgesModel.toggleBadgeWearing(badgeId);

			if (result)
			{
				updateState({
					badges: [...managers.inventory.badgesModel.getBadges()],
					activeBadges: [...managers.inventory.badgesModel.getBadges(1)],
					selectedBadge: managers.inventory.badgesModel.getSelectedBadge(),
				});
			}
		},

		/**
		 * Select an effect
		 */
		selectEffect: (effect: Effect): void =>
		{
			managers.inventory.effectsModel.setEffectSelected(effect.type);
			updateState({selectedEffect: effect});
		},

		/**
		 * Use an effect
		 */
		useEffect: (type: number): void =>
		{
			managers.inventory.effectsModel.useEffect(type);
			updateState({
				effects: [...managers.inventory.effectsModel.getEffects()],
				selectedEffect: managers.inventory.effectsModel.getSelectedEffect(),
			});
		},

		/**
		 * Stop using an effect
		 */
		stopUsingEffect: (type: number): void =>
		{
			managers.inventory.effectsModel.stopUsingEffect(type);
			updateState({
				effects: [...managers.inventory.effectsModel.getEffects()],
				selectedEffect: managers.inventory.effectsModel.getSelectedEffect(),
			});
		},

		/**
		 * Select a pet
		 */
		selectPet: (pet: Pet): void =>
		{
			managers.inventory.petsModel.selectPet(pet.id);
			updateState({selectedPet: pet});
		},

		/**
		 * Select a bot
		 */
		selectBot: (bot: Bot): void =>
		{
			managers.inventory.botsModel.selectBot(bot.id);
			updateState({selectedBot: bot});
		},

		/**
		 * Update unseen counts (called after message processing)
		 */
		updateUnseenCounts,

		/**
		 * Sync furni state from manager
		 */
		syncFurniState: (): void =>
		{
			const inv = managers.inventory;

			updateState({
				furniGroups: [...inv.furniModel.furniData],
				selectedFurniGroup: inv.furniModel.getSelectedItem(),
				isLoading: false,
			});
			updateUnseenCounts();
		},

		/**
		 * Sync badges state from manager
		 */
		syncBadgesState: (): void =>
		{
			const inv = managers.inventory;

			updateState({
				badges: [...inv.badgesModel.getBadges()],
				activeBadges: [...inv.badgesModel.getBadges(1)],
				selectedBadge: inv.badgesModel.getSelectedBadge(),
				isLoading: false,
			});
			updateUnseenCounts();
		},

		/**
		 * Sync pets state from manager
		 */
		syncPetsState: (): void =>
		{
			const inv = managers.inventory;

			updateState({
				pets: [...inv.petsModel.getPetsArray()],
				selectedPet: inv.petsModel.getSelectedPet(),
				isLoading: false,
			});
			updateUnseenCounts();
		},

		/**
		 * Sync bots state from manager
		 */
		syncBotsState: (): void =>
		{
			const inv = managers.inventory;

			updateState({
				bots: [...inv.botsModel.getBotsArray()],
				selectedBot: inv.botsModel.getSelectedBot(),
				isLoading: false,
			});
			updateUnseenCounts();
		},
	};
}

export type InventoryActions = ReturnType<typeof createActions>;
