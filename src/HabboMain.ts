import {HabboConfigurationManager} from '@habbo/configuration/HabboConfigurationManager';
import {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import {HabboCommunicationDemo} from '@habbo/communication/demo/HabboCommunicationDemo';
import {HabboLocalizationManager} from '@habbo/localization/HabboLocalizationManager';
import {HabboNavigator} from '@habbo/navigator/HabboNavigator';
import {HabboNewNavigator} from '@habbo/navigator/HabboNewNavigator';
import {HabboInventory} from '@habbo/inventory/HabboInventory';
import {RoomEngine, RoomMessageHandler} from '@habbo/room';
import {RoomManager} from '@room/RoomManager';
import {RoomSessionManager} from '@habbo/session/RoomSessionManager';
import {SessionDataManager} from '@habbo/session/SessionDataManager';
import {HabboCampaigns} from '@habbo/campaign/HabboCampaigns';
import {AdManager} from '@habbo/advertisement/AdManager';
import {HabboTracking} from '@habbo/tracking/HabboTracking';
import {HabboGroupsManager} from '@habbo/groups/HabboGroupsManager';
import {HabboNotifications} from '@habbo/notifications/HabboNotifications';
import {HabboToolbar} from '@habbo/toolbar/HabboToolbar';
import {HabboFreeFlowChat} from '@habbo/freeflowchat/HabboFreeFlowChat';
import {Logger} from '@core/utils/Logger';
import {connectionStore} from '@ui/stores/connectionStore';
import {sessionStore} from '@ui/stores/sessionStore';
import {favouritesStore} from '@ui/stores/favouritesStore';
import {roomStore} from '@ui/stores/roomStore';
import {configStore} from '@ui/stores/configStore';
import {localizationStore} from '@ui/stores/localizationStore';
import {navigatorStore} from '@ui/stores/navigatorStore';
import {inventoryStore} from '@ui/stores/inventoryStore';
import {landingViewStore} from '@ui/stores/landingViewStore';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNavigator} from '@iid/IIDHabboNavigator';
import {IID_HabboNewNavigator} from '@iid/IIDHabboNewNavigator';
import {IID_HabboInventory} from '@iid/IIDHabboInventory';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_RoomManager} from '@iid/IIDRoomManager';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {HabboProperty} from '@habbo/configuration';

import type {HeliumCore} from '@core/HeliumCore';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IGameDataResources} from '@core/localization/IGameDataResources';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {HeliumConfig} from './Helium';
import {IDisposable} from "@/core";

const log = Logger.getLogger('HabboMain');

/**
 * HabboMain
 *
 * Engine orchestrator for the Habbo client.
 * Manages all Habbo-specific managers, module system, and localization.
 *
 * Follows the AS3 pattern where HabboMain.as orchestrates the engine
 * while Habbo.as acts as the application shell.
 *
 * @see source_as_win63/habbo/HabboMain.as
 */
export class HabboMain implements IDisposable
{
	private _core: HeliumCore | null = null;
	private _habboCommunicationManager: HabboCommunicationManager | null = null;
	private _localizationManager: HabboLocalizationManager | null = null;
	private _campaigns: HabboCampaigns | null = null;
	private _adManager: AdManager | null = null;
	private _tracking: HabboTracking | null = null;
	private _groupsManager: HabboGroupsManager | null = null;
	private _notifications: HabboNotifications | null = null;
	private _toolbar: HabboToolbar | null = null;
	private _freeFlowChat: HabboFreeFlowChat | null = null;

	protected _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	private _navigator: HabboNavigator | null = null;

	get navigator(): HabboNavigator
	{
		if (!this._navigator)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._navigator;
	}

	private _newNavigator: HabboNewNavigator | null = null;

	get newNavigator(): HabboNewNavigator
	{
		if (!this._newNavigator)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._newNavigator;
	}

	private _inventory: HabboInventory | null = null;

	get inventory(): HabboInventory
	{
		if (!this._inventory)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._inventory;
	}

	private _configurationManager: HabboConfigurationManager | null = null;

	get configurationManager(): IHabboConfigurationManager
	{
		if (!this._configurationManager)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._configurationManager;
	}

	private _communicationDemo: HabboCommunicationDemo | null = null;

	get communicationDemo(): HabboCommunicationDemo
	{
		if (!this._communicationDemo)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._communicationDemo;
	}

	private _roomManager: RoomManager | null = null;

	get roomManager(): RoomManager
	{
		if (!this._roomManager)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._roomManager;
	}

	private _roomMessageHandler: RoomMessageHandler | null = null;

	get roomMessageHandler(): RoomMessageHandler
	{
		if (!this._roomMessageHandler)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._roomMessageHandler;
	}

	private _roomSessionManager: RoomSessionManager | null = null;

	get roomSessionManager(): RoomSessionManager
	{
		if (!this._roomSessionManager)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._roomSessionManager;
	}

	get localization(): HabboLocalizationManager
	{
		if (!this._localizationManager)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._localizationManager;
	}

	private _roomEngine: RoomEngine | null = null;

	get roomEngine(): RoomEngine
	{
		if (!this._roomEngine)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._roomEngine;
	}

	private _sessionDataManager: SessionDataManager | null = null;

	get sessionDataManager(): ISessionDataManager
	{
		if (!this._sessionDataManager)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._sessionDataManager;
	}

	get habboCommunication(): HabboCommunicationManager
	{
		if (!this._habboCommunicationManager)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._habboCommunicationManager;
	}

	// ── Initialization ───────────────────────────────────────────────

	/**
	 * Initialize the engine orchestrator
	 *
	 * @param core - The HeliumCore instance (created by Helium shell)
	 * @param config - Optional Helium configuration
	 */
	async init(core: HeliumCore, config?: HeliumConfig): Promise<void>
	{
		this._core = core;

		await this.initHabboManagers(config);

		this.initStores();

		this.initLocalization();
	}

	/**
	 * Dispose engine resources
	 *
	 * Disposes module system and RoomMessageHandler.
	 * Nullifies all manager references.
	 * Does NOT dispose HeliumCore (owned by Helium shell).
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		log.info('Disposing HabboMain...');

		// 1. Dispose RoomMessageHandler (not a Component, needs manual dispose)
		this._roomMessageHandler?.dispose();
		this._roomMessageHandler = null;

		// 3. Nullify Habbo manager refs (inverse init order)
		// These are Components - they will be disposed by context.dispose() in Helium
		this._freeFlowChat = null;
		this._toolbar = null;
		this._notifications = null;
		this._groupsManager = null;
		this._tracking = null;
		this._adManager = null;
		this._campaigns = null;
		this._roomEngine = null;
		this._inventory = null;
		this._newNavigator = null;
		this._navigator = null;
		this._sessionDataManager = null;
		this._roomSessionManager = null;
		this._roomManager = null;
		this._localizationManager = null;
		this._communicationDemo = null;
		this._habboCommunicationManager = null;
		this._configurationManager = null;

		// Do NOT dispose core - owned by Helium shell
		this._core = null;
	}

	/**
	 * Initialize Habbo-specific managers
	 *
	 * Order follows AS3 HabboMain.as initialization sequence:
	 * Config → Communication → Demo → Localization → RoomManager → RoomSessionManager
	 * → SessionDataManager → Navigator → Inventory → RoomEngine → RoomMessageHandler
	 */
	private async initHabboManagers(config?: HeliumConfig): Promise<void>
	{
		const ctx = this._core!.context;

		// 1. Configuration Manager (must be first - other managers depend on it)
		this._configurationManager = new HabboConfigurationManager(ctx);
		ctx.attachComponent(this._configurationManager, [IID_HabboConfigurationManager]);

		// Set external variables URL if provided (must be set before download)
		if (config?.configurationUrl)
		{
			this._configurationManager.setProperty(HabboProperty.EXTERNAL_RENDERER_VARIABLES, config.configurationUrl);
		}

		// Load external configuration
		await this._configurationManager.initConfigurationDownload();

		// Set configuration properties from config object (after download so resetAll doesn't clear them)
		if (config?.configuration)
		{
			for (const [key, value] of Object.entries(config.configuration))
			{
				this._configurationManager.setProperty(key, value);
			}
		}

		// Also pick up top-level string properties as configuration overrides
		if (config)
		{
			const reservedKeys = new Set(['background', 'resizeTo', 'antialias', 'resolution', 'canvas', 'connection', 'configurationUrl', 'configuration']);

			for (const [key, value] of Object.entries(config))
			{
				if (!reservedKeys.has(key) && typeof value === 'string')
				{
					this._configurationManager.setProperty(key, value);
				}
			}
		}

		// 2. Habbo Communication Manager (depends on CoreCommunicationManager from core)
		this._habboCommunicationManager = new HabboCommunicationManager(ctx);
		ctx.attachComponent(this._habboCommunicationManager, [IID_HabboCommunicationManager]);

		// Configure connection if provided
		if (config?.connection)
		{
			this._habboCommunicationManager.configure(config.connection);
		}

		// 3. Communication Demo (manages login flow, IncomingMessages)
		// AS3: HabboCommunicationDemo is a separate Component that orchestrates the connection
		this._communicationDemo = new HabboCommunicationDemo(ctx);
		ctx.attachComponent(this._communicationDemo, []);

		// 4. Localization Manager
		this._localizationManager = new HabboLocalizationManager(ctx);

		ctx.attachComponent(this._localizationManager, [IID_HabboLocalizationManager]);

		this._localizationManager.setConfigurationManager(this._configurationManager);
		this._localizationManager.setCommunicationManager(this._habboCommunicationManager);

		// Wire game data loading from hashes
		this._localizationManager.events.on('gameDataResourcesReady', (resources: IGameDataResources) =>
		{
			this.onGameDataResourcesReady(resources);
		});

		// 5. Room Manager (must be registered before RoomEngine)
		this._roomManager = new RoomManager(ctx);
		ctx.attachComponent(this._roomManager, [IID_RoomManager]);

		// 6. Room Session Manager
		this._roomSessionManager = new RoomSessionManager(ctx);
		ctx.attachComponent(this._roomSessionManager, [IID_RoomSessionManager]);

		// 7. Session Data Manager (manages user data after authentication)
		// AS3: HabboSessionDataManagerLib - depends on HabboCommunicationManager via IID
		this._sessionDataManager = new SessionDataManager(ctx);
		ctx.attachComponent(this._sessionDataManager, [IID_SessionDataManager]);

		// 8. Navigator (legacy)
		this._navigator = new HabboNavigator(ctx);
		ctx.attachComponent(this._navigator, [IID_HabboNavigator]);

		// 9. New Navigator
		this._newNavigator = new HabboNewNavigator(ctx);
		ctx.attachComponent(this._newNavigator, [IID_HabboNewNavigator]);

		// 10. Inventory
		this._inventory = new HabboInventory(ctx);
		ctx.attachComponent(this._inventory, [IID_HabboInventory]);

		// 11. Room Engine (depends on RoomManager via IID_RoomManager)
		this._roomEngine = new RoomEngine(ctx, this._core!.assets);
		ctx.attachComponent(this._roomEngine, [IID_RoomEngine]);

		// 12b. Campaign Calendar
		this._campaigns = new HabboCampaigns(ctx);
		ctx.attachComponent(this._campaigns, []);

		// 12c. Advertisement Manager
		this._adManager = new AdManager(ctx);
		ctx.attachComponent(this._adManager, []);

		// 12d. Tracking
		this._tracking = new HabboTracking(ctx);
		ctx.attachComponent(this._tracking, []);

		// 12e. Groups Manager
		this._groupsManager = new HabboGroupsManager(ctx);
		ctx.attachComponent(this._groupsManager, []);

		// 12f. Notifications
		this._notifications = new HabboNotifications(ctx);
		ctx.attachComponent(this._notifications, []);

		// 12g. Toolbar
		this._toolbar = new HabboToolbar(ctx);
		ctx.attachComponent(this._toolbar, []);

		// 12h. FreeFlowChat
		this._freeFlowChat = new HabboFreeFlowChat(ctx);
		ctx.attachComponent(this._freeFlowChat, []);

		// Set PixiJS stage on room engine for rendering
		this._roomEngine.setStage(this._core!.application.stage);

		// 12. Room Message Handler - bridges communication to room engine
		this._roomMessageHandler = new RoomMessageHandler(this._roomEngine);
	}

	/**
	 * Called when game data resources (hashes) are available.
	 * Sets config properties from hashes for game data loading.
	 */
	private async onGameDataResourcesReady(resources: IGameDataResources): Promise<void>
	{
		const config = this._configurationManager!;

		log.info('Game data resources (hashes) available, updating configuration...');

		// Override config properties with hash-derived URLs (url/hash format)
		if (resources.furnitureDataUrl && resources.furnitureDataHash)
		{
			config.setProperty('furnidata.url', `${resources.furnitureDataUrl}/${resources.furnitureDataHash}`);
		}

		if (resources.effectMapUrl && resources.effectMapHash)
		{
			config.setProperty('avatar.effectmap.url', `${resources.effectMapUrl}/${resources.effectMapHash}`);
		}

		if (resources.productDataUrl && resources.productDataHash)
		{
			config.setProperty('productdata.url', `${resources.productDataUrl}/${resources.productDataHash}`);
		}

		if (resources.figureDataUrl && resources.figureDataHash)
		{
			config.setProperty('avatar.figuredata.url', `${resources.figureDataUrl}/${resources.figureDataHash}`);
		}

		if (resources.figureMapUrl && resources.figureMapHash)
		{
			config.setProperty('avatar.figuremap.url', `${resources.figureMapUrl}/${resources.figureMapHash}`);
		}

		if (resources.habboAvatarActionsUrl && resources.habboAvatarActionsHash)
		{
			config.setProperty('avatar.actions.url', `${resources.habboAvatarActionsUrl}/${resources.habboAvatarActionsHash}`);
		}

		// Load external UI variables if available (separated from renderer variables)
		if (resources.externalUIVariablesUrl && resources.externalUIVariablesHash)
		{
			const uiVarsUrl = `${resources.externalUIVariablesUrl}/${resources.externalUIVariablesHash}`;

			config.setProperty('external.ui.variables.url', uiVarsUrl);

			await this.loadExternalUIVariables(uiVarsUrl);
		}
	}

	/**
	 * Load external UI variables and merge into configuration
	 */
	private async loadExternalUIVariables(url: string): Promise<void>
	{
		try
		{
			log.info(`Loading external UI variables from ${url}`);

			const response = await fetch(url);

			if (!response.ok)
			{
				log.warn(`Failed to load UI variables: HTTP ${response.status}`);
				return;
			}

			const text = await response.text();
			const trimmed = text.trim();

			if (trimmed.startsWith('{') || trimmed.startsWith('['))
			{
				const json = JSON.parse(trimmed);

				const flatten = (obj: Record<string, unknown>, prefix: string = ''): void =>
				{
					for (const [key, value] of Object.entries(obj))
					{
						if (value === null || value === undefined) continue;

						const fullKey = prefix ? `${prefix}.${key}` : key;

						if (typeof value === 'object' && !Array.isArray(value))
						{
							flatten(value as Record<string, unknown>, fullKey);
						}
						else
						{
							const stringValue = typeof value === 'string'
								? value
								: typeof value === 'number' || typeof value === 'boolean'
									? String(value)
									: JSON.stringify(value);

							this._configurationManager!.setProperty(fullKey, stringValue);
						}
					}
				};

				flatten(json);

				log.success('External UI variables loaded');
			} else
			{
				// key=value format
				const lines = text.split(/\n\r?|\r\n?/);

				for (const line of lines)
				{
					const t = line.trim();
					if (t.startsWith('#') || t === '') continue;

					const parts = t.split('=');
					if (parts.length >= 2 && parts[0].length > 0)
					{
						const key = parts.shift()!.trim();
						const value = parts.join('=').trim();
						this._configurationManager!.setProperty(key, value);
					}
				}

				log.success('External UI variables loaded (key=value)');
			}
		} catch (error)
		{
			log.warn(`Failed to load external UI variables: ${error}`);
		}
	}

	/**
	 * Initialize all SolidJS stores
	 */
	private initStores(): void
	{
		// Stores without manager dependencies
		sessionStore.init();
		favouritesStore.init();
		roomStore.init();

		// Wire connection actions to HabboCommunicationManager
		this._habboCommunicationManager!.setConnectionActions(connectionStore.actions);

		// Stores with manager dependencies
		configStore.init();
		localizationStore.init();
		navigatorStore.init();
		inventoryStore.init();
		landingViewStore.init();
	}


	/**
	 * Initialize localization
	 */
	private initLocalization(): void
	{
		if (this._configurationManager!.propertyExists('localization.1'))
		{
			const locName = this._configurationManager!.getProperty('localization.1');

			this._localizationManager!.activateLocalizationDefinition(locName);
		}
	}
}
