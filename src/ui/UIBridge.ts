import {configStore, connectionStore, favouritesStore, localizationStore, navigatorStore, roomStore, sessionStore} from './stores';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboNavigator, IHabboNewNavigator} from '@habbo/navigator';
import type {HabboCommunicationEventType} from '@habbo/communication/enum';

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
	 * Should be called after connection is established
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
	 * Connect SessionDataManager to the session store
	 */
	connectSessionDataManager(manager: ISessionDataManager): void
	{
		this._sessionDataManager = manager;

		// Listen to user data updates
		manager.events.on('userDataUpdated', () =>
		{
			sessionStore.setUserData({
				id: manager.userId,
				name: manager.userName,
				figure: manager.figure,
				gender: manager.gender,
				motto: manager.motto,
				realName: manager.realName,
				respectsReceived: manager.respectsReceived,
				respectsRemaining: manager.respectsRemaining,
				respectsPetRemaining: manager.respectsPetRemaining,
				streamPublishingAllowed: manager.streamPublishingAllowed,
				lastAccessDate: manager.lastAccessDate,
				canChangeName: manager.canChangeName,
				safetyLocked: manager.safetyLocked,
			});
		});

		// Listen to figure updates
		manager.events.on('figureUpdated', (figure: string, gender: string) =>
		{
			const current = sessionStore.userData();
			if (current)
			{
				sessionStore.setUserData({
					...current,
					figure,
					gender,
				});
			}
		});

		// Listen to availability status updates
		manager.events.on('availabilityStatusUpdated', (isOpen: boolean, onShutDown: boolean) =>
		{
			sessionStore.setAvailability({
				isOpen,
				onShutDown,
				isAuthenticHabbo: manager.isAuthenticHabbo,
			});
		});

		// Listen to rights updates
		manager.events.on('userRightsUpdated', () =>
		{
			sessionStore.setClubLevel(manager.clubLevel);
			sessionStore.setSecurityLevel(manager.securityLevel);
			sessionStore.setIsAmbassador(manager.isAmbassador);
		});

		// Listen to navigator settings
		manager.events.on('navigatorSettingsUpdated', () =>
		{
			sessionStore.setHomeRoomId(manager.homeRoomId);
			sessionStore.setRoomIdToEnter(manager.roomIdToEnter);
		});

		// Listen to favourites
		manager.events.on('favouritesUpdated', () =>
		{
			sessionStore.setFavouriteRooms([...manager.favouriteRooms]);
		});

		// Listen to activity points
		manager.events.on('activityPointsUpdated', () =>
		{
			sessionStore.setActivityPoints(new Map(manager.activityPoints));
		});

		// Listen to achievement score
		manager.events.on('achievementScoreUpdated', () =>
		{
			sessionStore.setAchievementScore(manager.achievementScore);
		});
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
	 * Set detailed login step from AS3 connection flow
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
