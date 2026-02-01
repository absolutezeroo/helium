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
import type {IHabboInventory} from '@habbo/inventory';
import type {HabboCommunicationEventType} from '@habbo/communication/enum';
import {registerMessageEvent} from './hooks';

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
 * Listens to events from managers and updates reactive stores
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

		navigatorStore.connect(navigator, newNavigator);
	}

	/**
	 * Connect Inventory to the inventory store
	 */
	connectInventory(inventory: IHabboInventory): void
	{
		this._inventory = inventory;

		inventoryStore.connect(inventory);
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
			navigatorStore.disconnect();

			this._navigator = null;
		}

		if (this._inventory)
		{
			inventoryStore.disconnect();

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
