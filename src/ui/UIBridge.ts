import {
	configStore,
	connectionStore,
	favouritesStore,
	inventoryStore,
	localizationStore,
	navigatorStore,
	roomStore,
	sessionStore
} from './stores';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboNavigator, IHabboNewNavigator} from '@habbo/navigator';
import type {Badge, Bot, IHabboInventory, InventoryCategoryType, Pet} from '@habbo/inventory';
import {FurnitureItem, GroupItem, InventoryCategory, PetFigureData} from '@habbo/inventory';
import type {HabboCommunicationEventType} from '@habbo/communication/enum';
import {registerMessageEvent} from './hooks';
import type {InventoryDataCallback} from './stores/inventory/inventoryStore';

// Message Events
import {UserObjectMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserObjectMessageEvent';
import {UserRightsMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserRightsMessageEvent';
import {AvailabilityStatusMessageEvent} from '@habbo/communication/messages/incoming/availability/AvailabilityStatusMessageEvent';
import {FigureUpdateMessageEvent} from '@habbo/communication/messages/incoming/avatar/FigureUpdateMessageEvent';
import {NavigatorSettingsMessageEvent} from '@habbo/communication/messages/incoming/navigator/NavigatorSettingsMessageEvent';
import {FavouritesMessageEvent} from '@habbo/communication/messages/incoming/navigator/FavouritesMessageEvent';
import {ActivityPointsMessageEvent} from '@habbo/communication/messages/incoming/notifications/ActivityPointsMessageEvent';
import {AchievementsScoreMessageEvent} from '@habbo/communication/messages/incoming/inventory/AchievementsScoreMessageEvent';

// Parsers
import type {UserObjectMessageParser} from '@habbo/communication/messages/parser/handshake/UserObjectMessageParser';
import type {UserRightsMessageParser} from '@habbo/communication/messages/parser/handshake/UserRightsMessageParser';
import type {AvailabilityStatusMessageParser} from '@habbo/communication/messages/parser/availability/AvailabilityStatusMessageParser';
import type {FigureUpdateMessageParser} from '@habbo/communication/messages/parser/avatar/FigureUpdateMessageParser';
import type {NavigatorSettingsMessageParser} from '@habbo/communication/messages/parser/navigator/NavigatorSettingsMessageParser';
import type {FavouritesMessageParser} from '@habbo/communication/messages/parser/navigator/FavouritesMessageParser';
import type {ActivityPointsMessageParser} from '@habbo/communication/messages/parser/notifications/ActivityPointsMessageParser';
import type {AchievementsScoreMessageParser} from '@habbo/communication/messages/parser/inventory/AchievementsScoreMessageParser';

/**
 * Bridge between Habbo managers and SolidJS stores
 *
 * This class:
 * - Holds references to managers
 * - Listens to events from managers and updates reactive stores
 * - Exposes actions that components call (delegating to managers)
 *
 * Stores should NOT hold manager references. This centralizes
 * all manager interactions in one place.
 */
export class UIBridge
{
	private _sessionDataManager: ISessionDataManager | null = null;
	private _configurationManager: IHabboConfigurationManager | null = null;
	private _localizationManager: IHabboLocalizationManager | null = null;
	private _navigator: IHabboNavigator | null = null;
	private _newNavigator: IHabboNewNavigator | null = null;
	private _inventory: IHabboInventory | null = null;

	// Cleanup functions
	private _cleanupFunctions: Array<() => void> = [];

	/**
	 * Connect ConfigurationManager to config store
	 */
	connectConfigurationManager(manager: IHabboConfigurationManager): void
	{
		this._configurationManager = manager;

		configStore.connect(manager);
	}

	/**
	 * Connect LocalizationManager to localization store
	 */
	connectLocalizationManager(manager: IHabboLocalizationManager): void
	{
		this._localizationManager = manager;

		localizationStore.connect(manager);
	}

	/**
	 * Initialize room-related stores
	 * Should be called after a connection is established
	 */
	initRoomStores(): void
	{
		roomStore.init();
		favouritesStore.init();
	}

	/**
	 * Connect Navigator to the navigator store
	 */
	connectNavigator(navigator: IHabboNavigator, newNavigator?: IHabboNewNavigator): void
	{
		this._navigator = navigator;
		this._newNavigator = newNavigator ?? null;

		// Initialize navigator store and set up initial search callback
		navigatorStore.init();
		navigatorStore.setOnInitialSearch((searchCode) =>
		{
			this._newNavigator?.performSearch(searchCode);
		});
	}

	/**
	 * Connect Inventory to the inventory store
	 */
	connectInventory(inventory: IHabboInventory): void
	{
		this._inventory = inventory;

		// Ensure inventory is initialized
		if (!inventory.isInitialized)
		{
			inventory.init();
		}

		// Initialize inventory store with data callback
		inventoryStore.init();
		inventoryStore.setDataCallback(this._createInventoryDataCallback());
	}

	/**
	 * Create inventory data callback for handling message updates
	 */
	private _createInventoryDataCallback(): InventoryDataCallback
	{
		const inventory = this._inventory!;

		return {
			onFurniList: (parser) =>
			{
				if (parser.totalFragments === 1 || parser.fragmentNo === parser.totalFragments - 1)
				{
					// All fragments received, convert to FurnitureItemData and update model
					const furnitureItems = new Map<number, import('@habbo/inventory').FurnitureItemData>();

					for (const [id, itemParser] of parser.items)
					{
						furnitureItems.set(id, itemParser.toFurnitureItemData());
					}

					inventory.furniModel.insertFurniture(furnitureItems);

					// Mark both furni and rentables as initialized
					inventory.setCategoryInitialized(InventoryCategory.FURNI);
					inventory.setCategoryInitialized(InventoryCategory.RENTABLES);

					inventoryStore.updateFurni(
						[...inventory.furniModel.furniData],
						inventory.furniModel.getSelectedItem()
					);
					this._updateUnseenCounts();
					inventoryStore.updateLoading(false);
				}
			},

			onFurniAddOrUpdate: (parser) =>
			{
				for (const itemParser of parser.items)
				{
					const item = new FurnitureItem(itemParser.toFurnitureItemData());

					inventory.furniModel.addOrUpdateItem(item, false);
				}

				inventoryStore.updateFurni(
					[...inventory.furniModel.furniData],
					inventory.furniModel.getSelectedItem()
				);
				this._updateUnseenCounts();
			},

			onFurniRemove: (itemId) =>
			{
				inventory.furniModel.removeFurni(itemId);

				inventoryStore.updateFurni(
					[...inventory.furniModel.furniData],
					inventory.furniModel.getSelectedItem()
				);
			},

			onFurniInvalidate: () =>
			{
				inventory.furniModel.clearFurniList();

				inventoryStore.updateFurni([], null);
				inventoryStore.updateLoading(true);
			},

			onBadges: (parser) =>
			{
				// Initialize badges with placeholder name/desc functions
				const badgeDataForModel = parser.badges.map(b => ({
					badgeId: b.badgeId,
					slotId: parser.activeBadgeIds.includes(b.badgeId) ? (parser.activeBadgeIds.indexOf(b.badgeId) + 1) : 0,
				}));

				inventory.badgesModel.initBadges(
					badgeDataForModel,
					(id) => id,
					(id) => `Badge: ${id}`
				);

				inventory.setCategoryInitialized(InventoryCategory.BADGES);

				inventoryStore.updateBadges(
					[...inventory.badgesModel.getBadges()],
					[...inventory.badgesModel.getBadges(1)],
					inventory.badgesModel.getSelectedBadge()
				);
				this._updateUnseenCounts();
				inventoryStore.updateLoading(false);
			},

			onPets: (parser) =>
			{
				const {Pet, PetFigureData} = require('@habbo/inventory');
				const petsMap = new Map<number, Pet>();

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

				inventory.petsModel.updatePets(petsMap);
				inventory.setCategoryInitialized(InventoryCategory.PETS);

				inventoryStore.updatePets(
					[...inventory.petsModel.getPetsArray()],
					inventory.petsModel.getSelectedPet()
				);
				this._updateUnseenCounts();
				inventoryStore.updateLoading(false);
			},

			onBots: (parser) =>
			{
				const {Bot} = require('@habbo/inventory');
				const botsMap = new Map<number, Bot>();

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

				inventory.botsModel.updateBots(botsMap);
				inventory.setCategoryInitialized(InventoryCategory.BOTS);

				inventoryStore.updateBots(
					[...inventory.botsModel.getBotsArray()],
					inventory.botsModel.getSelectedBot()
				);
				this._updateUnseenCounts();
				inventoryStore.updateLoading(false);
			},
		};
	}

	/**
	 * Update unseen counts from tracker
	 */
	private _updateUnseenCounts(): void
	{
		if (!this._inventory) return;

		const tracker = this._inventory.unseenItemTracker;

		inventoryStore.updateUnseenCounts(
			tracker.getCount(1) + tracker.getCount(2),
			tracker.getCount(4),
			tracker.getCount(3),
			tracker.getCount(5)
		);
	}

	/**
	 * Connect SessionDataManager to the session store
	 */
	connectSessionDataManager(manager: ISessionDataManager): void
	{
		this._sessionDataManager = manager;

		// Listen to user data updates via message events
		this._cleanupFunctions.push(
			registerMessageEvent(UserObjectMessageEvent, (_, parser) =>
			{
				const p = parser as UserObjectMessageParser;

				sessionStore.setUserData({
					id: p.id,
					name: p.name,
					figure: p.figure,
					gender: p.sex,
					motto: p.customData,
					realName: p.realName,
					respectsReceived: p.respectTotal,
					respectsRemaining: p.respectLeft,
					respectsPetRemaining: p.petRespectLeft,
					streamPublishingAllowed: p.streamPublishingAllowed,
					lastAccessDate: p.lastAccessDate,
					canChangeName: p.nameChangeAllowed,
					safetyLocked: p.accountSafetyLocked,
				});
			})
		);

		// Listen to figure updates
		this._cleanupFunctions.push(
			registerMessageEvent(FigureUpdateMessageEvent, (_, parser) =>
			{
				const p = parser as FigureUpdateMessageParser;
				const current = sessionStore.userData();

				if (current)
				{
					sessionStore.setUserData({
						...current,
						figure: p.figure,
						gender: p.gender,
					});
				}
			})
		);

		// Listen to availability status updates
		this._cleanupFunctions.push(
			registerMessageEvent(AvailabilityStatusMessageEvent, (_, parser) =>
			{
				const p = parser as AvailabilityStatusMessageParser;

				sessionStore.setAvailability({
					isOpen: p.isOpen,
					onShutDown: p.onShutDown,
					isAuthenticHabbo: p.isAuthenticHabbo,
				});
			})
		);

		// Listen to rights updates
		this._cleanupFunctions.push(
			registerMessageEvent(UserRightsMessageEvent, (_, parser) =>
			{
				const p = parser as UserRightsMessageParser;

				sessionStore.setClubLevel(p.clubLevel);
				sessionStore.setSecurityLevel(p.securityLevel);
				sessionStore.setIsAmbassador(p.isAmbassador);
			})
		);

		// Listen to navigator settings
		this._cleanupFunctions.push(
			registerMessageEvent(NavigatorSettingsMessageEvent, (_, parser) =>
			{
				const p = parser as NavigatorSettingsMessageParser;

				sessionStore.setHomeRoomId(p.homeRoomId);
				sessionStore.setRoomIdToEnter(p.roomIdToEnter);
			})
		);

		// Listen to favourites
		this._cleanupFunctions.push(
			registerMessageEvent(FavouritesMessageEvent, (_, parser) =>
			{
				const p = parser as FavouritesMessageParser;

				sessionStore.setFavouriteRooms([...p.favouriteRoomIds]);
			})
		);

		// Listen to activity points
		this._cleanupFunctions.push(
			registerMessageEvent(ActivityPointsMessageEvent, (_, parser) =>
			{
				const p = parser as ActivityPointsMessageParser;

				sessionStore.setActivityPoints(new Map(p.points));
			})
		);

		// Listen to achievement score
		this._cleanupFunctions.push(
			registerMessageEvent(AchievementsScoreMessageEvent, (_, parser) =>
			{
				const p = parser as AchievementsScoreMessageParser;

				sessionStore.setAchievementScore(p.score);
			})
		);
	}

	/**
	 * Set a connection state
	 */
	setConnectionState(state: 'connecting' | 'connected' | 'authenticated' | 'disconnected' | 'error', error?: string): void
	{
		switch (state)
		{
			case 'connecting':
				connectionStore.setConnecting();
				break;
			case 'connected':
				connectionStore.setConnected();
				break;
			case 'authenticated':
				connectionStore.setAuthenticated();
				break;
			case 'disconnected':
				connectionStore.setDisconnected();
				sessionStore.reset();
				break;
			case 'error':
				connectionStore.setError(error || 'Unknown error');
				break;
		}
	}

	/**
	 * Set a detailed login step from AS3 connection flow
	 * Called by IncomingMessages during handshake/authentication
	 */
	setLoginStep(step: HabboCommunicationEventType): void
	{
		connectionStore.setLoginStep(step);
	}

	// ========== Navigator Actions ==========

	/**
	 * Open the navigator and trigger manager open
	 */
	openNavigator(): void
	{
		navigatorStore.openNavigator();
		this._newNavigator?.open();
	}

	/**
	 * Close the navigator and trigger manager close
	 */
	closeNavigator(): void
	{
		navigatorStore.closeNavigator();
		this._newNavigator?.close();
	}

	/**
	 * Toggle navigator visibility
	 */
	toggleNavigator(): void
	{
		if (navigatorStore.isOpen())
		{
			this.closeNavigator();
		}
		else
		{
			this.openNavigator();
		}
	}

	/**
	 * Open create room modal
	 */
	openCreateRoomModal(): void
	{
		navigatorStore.openCreateModal();
		this._navigator?.startRoomCreation();
	}

	/**
	 * Perform navigator search
	 */
	performNavigatorSearch(searchCode: string, filtering: string = ''): void
	{
		navigatorStore.updateSearchCode(searchCode);
		this._newNavigator?.performSearch(searchCode, filtering);
	}

	/**
	 * Go to home room
	 */
	goToHomeRoom(): boolean
	{
		return this._navigator?.goToHomeRoom() ?? false;
	}

	/**
	 * Go to a private room by ID
	 */
	goToPrivateRoom(roomId: number): void
	{
		this._navigator?.goToPrivateRoom(roomId);
	}

	/**
	 * Search rooms by text
	 */
	searchRooms(query: string): void
	{
		this._navigator?.performTextSearch(query);
	}

	/**
	 * Search rooms by tag
	 */
	searchByTag(tag: string): void
	{
		this._navigator?.performTagSearch(tag);
	}

	/**
	 * Show user's own rooms
	 */
	showOwnRooms(): void
	{
		this._navigator?.showOwnRooms();
	}

	// ========== Inventory Actions ==========

	/**
	 * Open inventory and optionally switch to a category
	 */
	openInventory(category?: InventoryCategoryType): void
	{
		inventoryStore.openInventory();

		if (category)
		{
			this.switchInventoryCategory(category);
		}
		else
		{
			// Default to furni category and request data
			if (!this._inventory?.isCategoryInitialized(InventoryCategory.FURNI))
			{
				inventoryStore.updateLoading(true);
				this._inventory?.requestFurni();
			}
		}
	}

	/**
	 * Close inventory and reset unseen for current category
	 */
	closeInventory(): void
	{
		this._resetUnseenForCategory(inventoryStore.currentCategory());
		inventoryStore.closeInventory();
	}

	/**
	 * Toggle inventory visibility
	 */
	toggleInventory(): void
	{
		if (inventoryStore.isOpen())
		{
			this.closeInventory();
		}
		else
		{
			this.openInventory();
		}
	}

	/**
	 * Switch inventory category
	 */
	switchInventoryCategory(category: InventoryCategoryType): void
	{
		// Reset unseen for previous category
		this._resetUnseenForCategory(inventoryStore.currentCategory());

		inventoryStore.updateCategory(category);
		this._inventory?.switchCategory(category);

		// Request data and update view based on category
		switch (category)
		{
			case InventoryCategory.FURNI:
			case InventoryCategory.RENTABLES:
				if (!this._inventory?.isCategoryInitialized(category))
				{
					inventoryStore.updateLoading(true);
					this._inventory?.requestFurni();
				}
				else
				{
					inventoryStore.updateFurni(
						[...this._inventory?.furniModel.furniData ?? []],
						this._inventory?.furniModel.getSelectedItem() ?? null
					);
				}
				break;

			case InventoryCategory.BADGES:
				if (!this._inventory?.isCategoryInitialized(category))
				{
					inventoryStore.updateLoading(true);
					this._inventory?.requestBadges();
				}
				else
				{
					inventoryStore.updateBadges(
						[...this._inventory?.badgesModel.getBadges() ?? []],
						[...this._inventory?.badgesModel.getBadges(1) ?? []],
						this._inventory?.badgesModel.getSelectedBadge() ?? null
					);
				}
				break;

			case InventoryCategory.EFFECTS:
				inventoryStore.updateEffects(
					[...this._inventory?.effectsModel.getEffects() ?? []],
					this._inventory?.effectsModel.getSelectedEffect() ?? null
				);
				break;

			case InventoryCategory.PETS:
				if (!this._inventory?.isCategoryInitialized(category))
				{
					inventoryStore.updateLoading(true);
					this._inventory?.requestPets();
				}
				else
				{
					inventoryStore.updatePets(
						[...this._inventory?.petsModel.getPetsArray() ?? []],
						this._inventory?.petsModel.getSelectedPet() ?? null
					);
				}
				break;

			case InventoryCategory.BOTS:
				if (!this._inventory?.isCategoryInitialized(category))
				{
					inventoryStore.updateLoading(true);
					this._inventory?.requestBots();
				}
				else
				{
					inventoryStore.updateBots(
						[...this._inventory?.botsModel.getBotsArray() ?? []],
						this._inventory?.botsModel.getSelectedBot() ?? null
					);
				}
				break;
		}
	}

	/**
	 * Select a furniture group
	 */
	selectFurniGroup(group: GroupItem): void
	{
		this._inventory?.furniModel.selectItem(group);
		inventoryStore.updateSelectedFurniGroup(group);
	}

	/**
	 * Select a badge
	 */
	selectBadge(badge: Badge): void
	{
		this._inventory?.badgesModel.setBadgeSelected(badge.badgeId);
		inventoryStore.updateSelectedBadge(badge);
	}

	/**
	 * Toggle badge wearing
	 */
	toggleBadgeWearing(badgeId: string): void
	{
		const result = this._inventory?.badgesModel.toggleBadgeWearing(badgeId);

		if (result)
		{
			inventoryStore.updateBadges(
				[...this._inventory?.badgesModel.getBadges() ?? []],
				[...this._inventory?.badgesModel.getBadges(1) ?? []],
				this._inventory?.badgesModel.getSelectedBadge() ?? null
			);
		}
	}

	/**
	 * Select an effect
	 */
	selectEffect(effect: import('@habbo/inventory').Effect): void
	{
		this._inventory?.effectsModel.setEffectSelected(effect.type);
		inventoryStore.updateSelectedEffect(effect);
	}

	/**
	 * Use an effect
	 */
	useEffect(type: number): void
	{
		this._inventory?.effectsModel.useEffect(type);
		inventoryStore.updateEffects(
			[...this._inventory?.effectsModel.getEffects() ?? []],
			this._inventory?.effectsModel.getSelectedEffect() ?? null
		);
	}

	/**
	 * Stop using an effect
	 */
	stopUsingEffect(type: number): void
	{
		this._inventory?.effectsModel.stopUsingEffect(type);
		inventoryStore.updateEffects(
			[...this._inventory?.effectsModel.getEffects() ?? []],
			this._inventory?.effectsModel.getSelectedEffect() ?? null
		);
	}

	/**
	 * Select a pet
	 */
	selectPet(pet: Pet): void
	{
		this._inventory?.petsModel.selectPet(pet.id);
		inventoryStore.updateSelectedPet(pet);
	}

	/**
	 * Select a bot
	 */
	selectBot(bot: Bot): void
	{
		this._inventory?.botsModel.selectBot(bot.id);
		inventoryStore.updateSelectedBot(bot);
	}

	/**
	 * Reset unseen for a category
	 */
	private _resetUnseenForCategory(category: InventoryCategoryType): void
	{
		if (!this._inventory) return;

		switch (category)
		{
			case InventoryCategory.FURNI:
				this._inventory.unseenItemTracker.resetCategory(1);
				break;

			case InventoryCategory.RENTABLES:
				this._inventory.unseenItemTracker.resetCategory(2);
				break;

			case InventoryCategory.PETS:
				this._inventory.unseenItemTracker.resetCategory(3);
				break;

			case InventoryCategory.BADGES:
				this._inventory.unseenItemTracker.resetCategory(4);
				break;

			case InventoryCategory.BOTS:
				this._inventory.unseenItemTracker.resetCategory(5);
				break;
		}

		this._updateUnseenCounts();
	}

	/**
	 * Disconnect and cleanup
	 */
	disconnect(): void
	{
		this._sessionDataManager = null;
		this._configurationManager = null;
		this._localizationManager = null;

		if (this._navigator)
		{
			navigatorStore.dispose();
			navigatorStore.setOnInitialSearch(null);

			this._navigator = null;
		}

		if (this._inventory)
		{
			inventoryStore.dispose();
			inventoryStore.setDataCallback(null);

			this._inventory = null;
		}

		for (const cleanup of this._cleanupFunctions)
		{
			cleanup();
		}

		this._cleanupFunctions.length = 0;
		this._newNavigator = null;

		// Cleanup room stores
		roomStore.dispose();
		favouritesStore.dispose();

		sessionStore.reset();
		connectionStore.setDisconnected();
	}
}

// Singleton instance
export const uiBridge = new UIBridge();
