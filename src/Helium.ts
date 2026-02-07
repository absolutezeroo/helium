import {Application} from 'pixi.js';
import {HeliumCore, HeliumCoreConfig} from '@core/HeliumCore';
import {ComponentContext} from '@core/runtime';
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
import {mountUI} from '@ui/index';
import {
	configModule,
	connectionModule,
	favouritesModule,
	inventoryModule,
	localizationModule,
	loggingMiddleware,
	MessageBus,
	ModuleId,
	ModuleRegistry,
	navigatorModule,
	roomModule,
	sessionModule,
} from '@/modules';
import '@ui/styles/index.css';

import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IGameDataResources} from '@core/localization/IGameDataResources';
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
import {HabboProperty} from "@habbo/configuration";

import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';

const log = Logger.getLogger('Helium');

/**
 * Connection configuration
 */
export interface ConnectionConfig
{
	/** Server host (can include ws:// or wss://) */
	host: string;

	/** Server ports to try */
	ports: number[];

	/** SSO ticket for authentication */
	ssoTicket?: string;

	/** Auto-connect on initialization */
	autoConnect?: boolean;
}

/**
 * Helium configuration
 */
export interface HeliumConfig extends HeliumCoreConfig
{
	/** Connection configuration */
	connection?: ConnectionConfig;

	/** URL to load external configuration from (external_variables.txt) */
	configurationUrl?: string;

	/** Configuration object (alternative to URL) */
	configuration?: Record<string, string>;

	/** Allow arbitrary configuration properties at the top level */
	[key: string]: unknown;
}

/**
 * Helium
 *
 * Main application class for the Helium Habbo client.
 * This layer handles Habbo-specific functionality:
 * - Habbo managers (Configuration, Communication, Localization, etc.)
 * - Module system (MessageBus, ModuleRegistry)
 * - UI (SolidJS)
 *
 * Uses HeliumCore for fundamental engine features.
 */
export class Helium
{
	// Habbo managers
	private _configurationManager: HabboConfigurationManager | null = null;
	private _habboCommunicationManager: HabboCommunicationManager | null = null;
	private _communicationDemo: HabboCommunicationDemo | null = null;
	private _localizationManager: HabboLocalizationManager | null = null;
	private _navigator: HabboNavigator | null = null;
	private _newNavigator: HabboNewNavigator | null = null;
	private _inventory: HabboInventory | null = null;
	private _roomManager: RoomManager | null = null;
	private _roomMessageHandler: RoomMessageHandler | null = null;
	private _roomSessionManager: RoomSessionManager | null = null;
	// UI
	private _disposeUI: (() => void) | null = null;
	// State
	private _ready: boolean = false;
	private _campaigns: HabboCampaigns | null = null;
	private _adManager: AdManager | null = null;
	private _tracking: HabboTracking | null = null;
	private _groupsManager: HabboGroupsManager | null = null;
	private _notifications: HabboNotifications | null = null;
	private _toolbar: HabboToolbar | null = null;
	private _freeFlowChat: HabboFreeFlowChat | null = null;

	private static _instance: Helium;

	/**
	 * Get the singleton instance
	 */
	public static get instance(): Helium
	{
		if (!this._instance)
		{
			this._instance = new Helium();
		}

		return this._instance;
	}

	private _sessionDataManager: SessionDataManager | null = null;

	/**
	 * Get the session data manager
	 */
	get sessionDataManager(): ISessionDataManager
	{
		if (!this._sessionDataManager)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._sessionDataManager;
	}

	// Core layer
	private _core: HeliumCore | null = null;

	/**
	 * Get the core layer
	 */
	get core(): HeliumCore
	{
		if (!this._core)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._core;
	}

	private _roomEngine: RoomEngine | null = null;

	/**
	 * Get the room engine
	 */
	get roomEngine(): RoomEngine
	{
		if (!this._roomEngine)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._roomEngine;
	}

	// Module system
	private _messageBus: MessageBus | null = null;

	/**
	 * Get the message bus
	 */
	get messageBus(): MessageBus
	{
		if (!this._messageBus)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._messageBus;
	}

	private _moduleRegistry: ModuleRegistry | null = null;

	/**
	 * Get the module registry
	 */
	get moduleRegistry(): ModuleRegistry
	{
		if (!this._moduleRegistry)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._moduleRegistry;
	}

	get isReady(): boolean
	{
		return this._ready;
	}

	/**
	 * Get the component context (shortcut to core.context)
	 */
	get context(): ComponentContext
	{
		return this.core.context;
	}

	/**
	 * Get the PixiJS application (shortcut to core.application)
	 */
	get application(): Application
	{
		return this.core.application;
	}

	/**
	 * Get the core communication manager (shortcut to core.communication)
	 */
	get communication(): ICoreCommunicationManager
	{
		return this.core.communication;
	}

	/**
	 * Get the configuration manager
	 */
	get configuration(): IHabboConfigurationManager
	{
		if (!this._configurationManager)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._configurationManager;
	}

	/**
	 * Get the Habbo communication manager
	 */
	get habboCommunication(): HabboCommunicationManager
	{
		if (!this._habboCommunicationManager)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._habboCommunicationManager;
	}

	/**
	 * Bootstrap the application
	 */
	public static async bootstrap(config?: HeliumConfig): Promise<Helium>
	{
		const instance = this.instance;

		await instance.init(config);

		return instance;
	}

	/**
	 * Connect to the Habbo server
	 *
	 * Uses HabboCommunicationDemo (AS3 pattern) to manage the login flow:
	 * setSSOTicket → initGameSocket → initConnection → IncomingMessages → handshake
	 */
	public connect(): void
	{
		if (!this._communicationDemo || !this._habboCommunicationManager)
		{
			throw new Error('[Helium] Not initialized');
		}

		log.info('Connecting to server...');

		const ssoTicket = this._habboCommunicationManager.ssoTicket;

		if (ssoTicket)
		{
			this._communicationDemo.setSSOTicket(ssoTicket);
		} else
		{
			this._communicationDemo.initGameSocket();
		}

		// Wire RoomMessageHandler to the connection (created in initConnection)
		if (this._roomMessageHandler && this._habboCommunicationManager.connection)
		{
			this._roomMessageHandler.connection = this._habboCommunicationManager.connection;
		}
	}

	/**
	 * Disconnect from the server
	 */
	public disconnect(): void
	{
		this._habboCommunicationManager?.disconnect();
	}

	/**
	 * Dispose the application
	 *
	 * Order: UI → Module system → RoomMessageHandler (not a Component)
	 * → Nullify manager refs → Core (context.dispose() disposes all Components)
	 */
	public dispose(): void
	{
		log.info('Disposing Helium...');

		// 1. Dispose UI
		this._disposeUI?.();
		this._disposeUI = null;

		// 2. Dispose module system
		this._moduleRegistry?.dispose();
		this._moduleRegistry = null;
		this._messageBus?.clear();
		this._messageBus = null;

		// 3. Dispose RoomMessageHandler (not a Component, needs manual dispose)
		this._roomMessageHandler?.dispose();
		this._roomMessageHandler = null;

		// 4. Nullify Habbo manager refs (inverse init order)
		// These are Components - they will be disposed by context.dispose() below
		this._campaigns = null;
		this._adManager = null;
		this._tracking = null;
		this._groupsManager = null;
		this._notifications = null;
		this._toolbar = null;
		this._freeFlowChat = null;
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

		// 5. Dispose core (context.dispose() disposes all attached Components)
		this._core?.dispose();
		this._core = null;

		this._ready = false;
	}

	/**
	 * Initialize the application
	 */
	private async init(config?: HeliumConfig): Promise<void>
	{
		log.info('Initializing Helium...');

		this._core = new HeliumCore();
		await this._core.init(config);

		await this.initHabboManagers(config);

		this.initModuleSystem();

		await this.registerModules();

		this.initLocalization();
		this.mountUI();

		this._ready = true;
		log.success('Ready!');

		// Auto-connect if configured
		if (config?.connection?.autoConnect)
		{
			this.connect();
		}
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

		// Load external configuration (blocks until loaded)
		// NOTE: initComponent() → resetAll() fires as a microtask during the fetch,
		// clearing _configurationData. Properties must be set AFTER this completes.
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
		// (allows setting 'flash.client.url' etc. directly in the config)
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
	 * Sets config properties from hashes and triggers GameDataManager loading.
	 */
	private onGameDataResourcesReady(resources: IGameDataResources): void
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

			this.loadExternalUIVariables(uiVarsUrl);
		}

		// Feed GameDataManager with hash-derived URLs
		this._core!.gameData.loadGameData({
			furnitureDataUrl: config.getProperty('furnidata.url'),
			effectMapUrl: config.getProperty('avatar.effectmap.url'),
			productDataUrl: config.getProperty('productdata.url'),
			figureDataUrl: config.getProperty('avatar.figuredata.url'),
			figureMapUrl: config.getProperty('avatar.figuremap.url'),
		});
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

				for (const [key, value] of Object.entries(json))
				{
					if (value === null || value === undefined) continue;

					const stringValue = typeof value === 'string'
						? value
						: typeof value === 'number' || typeof value === 'boolean'
							? String(value)
							: JSON.stringify(value);

					this._configurationManager!.setProperty(key, stringValue);
				}

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
	 * Initialize the module system (MessageBus + ModuleRegistry)
	 */
	private initModuleSystem(): void
	{
		// Create MessageBus
		this._messageBus = new MessageBus();

		// Add logging middleware in development
		if (import.meta.env.DEV)
		{
			this._messageBus.use(loggingMiddleware);
		}

		// Create ModuleRegistry
		this._moduleRegistry = new ModuleRegistry(this._core!.context, this._messageBus);

		// Connect MessageBus to HabboCommunicationManager
		this._habboCommunicationManager!.onMessage((event) =>
		{
			this._messageBus!.dispatch(event);
		});
	}

	/**
	 * Register all modules
	 */
	private async registerModules(): Promise<void>
	{
		// Modules without manager dependencies
		await this._moduleRegistry!.register(sessionModule);
		await this._moduleRegistry!.register(connectionModule);
		await this._moduleRegistry!.register(roomModule);
		await this._moduleRegistry!.register(favouritesModule);

		// Wire connection actions to HabboCommunicationManager
		const connectionActions = this._moduleRegistry!.get(ModuleId.Connection).actions;
		this._habboCommunicationManager!.setConnectionActions(connectionActions);

		// Modules with manager dependencies
		await this._moduleRegistry!.register(configModule);
		await this._moduleRegistry!.register(localizationModule);
		await this._moduleRegistry!.register(navigatorModule);
		await this._moduleRegistry!.register(inventoryModule);
	}

	/**
	 * Initialize localization
	 */
	private initLocalization(): void
	{
		// Activate default localization if configured
		if (this._configurationManager!.propertyExists('localization.1'))
		{
			const locName = this._configurationManager!.getProperty('localization.1');

			this._localizationManager!.activateLocalizationDefinition(locName);
		}
	}

	/**
	 * Mount the SolidJS UI
	 */
	private mountUI(): void
	{
		const uiContainer = document.createElement('div');

		uiContainer.id = 'helium-ui';

		document.body.appendChild(uiContainer);

		this._disposeUI = mountUI(uiContainer, this._moduleRegistry!);
	}
}

export default Helium;
