import {Application} from 'pixi.js';
import {HeliumCore, HeliumCoreConfig} from '@core/HeliumCore';
import {ComponentContext} from '@core/runtime';
import {HabboConfigurationManager} from '@habbo/configuration/HabboConfigurationManager';
import {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import {HabboLocalizationManager} from '@habbo/localization/HabboLocalizationManager';
import {HabboNavigator} from '@habbo/navigator/HabboNavigator';
import {HabboNewNavigator} from '@habbo/navigator/HabboNewNavigator';
import {HabboInventory} from '@habbo/inventory/HabboInventory';
import {RoomEngine, RoomMessageHandler} from '@habbo/room';
import {Logger} from '@core/utils/Logger';
import {mountUI} from '@ui/index';
import {
	loggingMiddleware,
	MessageBus,
	ModuleRegistry,
	ModuleId,
	sessionModule,
	navigatorModule,
	connectionModule,
	roomModule,
	favouritesModule,
	configModule,
	localizationModule,
	inventoryModule,
} from '@/modules';
import '@ui/styles.css';

import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNavigator} from '@iid/IIDHabboNavigator';
import {IID_HabboNewNavigator} from '@iid/IIDHabboNewNavigator';
import {IID_HabboInventory} from '@iid/IIDHabboInventory';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';

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
	private static _instance: Helium;

	// Core layer
	private _core: HeliumCore | null = null;

	// Habbo managers
	private _configurationManager: HabboConfigurationManager | null = null;
	private _habboCommunicationManager: HabboCommunicationManager | null = null;
	private _localizationManager: HabboLocalizationManager | null = null;
	private _navigator: HabboNavigator | null = null;
	private _newNavigator: HabboNewNavigator | null = null;
	private _inventory: HabboInventory | null = null;
	private _roomEngine: RoomEngine | null = null;
	private _roomMessageHandler: RoomMessageHandler | null = null;

	// Module system
	private _messageBus: MessageBus | null = null;
	private _moduleRegistry: ModuleRegistry | null = null;

	// UI
	private _disposeUI: (() => void) | null = null;

	// State
	private _ready: boolean = false;

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
	 * Initialize the application
	 */
	private async init(config?: HeliumConfig): Promise<void>
	{
		log.info('Initializing Helium...');

		// ========== 1. Initialize Core Layer ==========
		this._core = new HeliumCore();
		await this._core.init(config);

		// ========== 2. Initialize Habbo Managers ==========
		await this.initHabboManagers(config);

		// ========== 3. Initialize Module System ==========
		this.initModuleSystem();

		// ========== 4. Register Modules ==========
		await this.registerModules();

		// ========== 5. Final Setup ==========
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
	 */
	private async initHabboManagers(config?: HeliumConfig): Promise<void>
	{
		const ctx = this._core!.context;

		// Configuration Manager (must be first - other managers depend on it)
		this._configurationManager = new HabboConfigurationManager(ctx);
		ctx.attachComponent(this._configurationManager, [IID_HabboConfigurationManager]);

		// Set configuration properties from config object
		if (config?.configuration)
		{
			for (const [key, value] of Object.entries(config.configuration))
			{
				this._configurationManager.setProperty(key, value);
			}
		}

		// Set external variables URL if provided
		if (config?.configurationUrl)
		{
			this._configurationManager.setProperty('external.variables.txt', config.configurationUrl);
		}

		// Load external configuration (blocks until loaded)
		await this._configurationManager.initConfigurationDownload();

		// Habbo Communication Manager (depends on CoreCommunicationManager from core)
		this._habboCommunicationManager = new HabboCommunicationManager(ctx);
		ctx.attachComponent(this._habboCommunicationManager, [IID_HabboCommunicationManager]);

		// Configure connection if provided
		if (config?.connection)
		{
			this._habboCommunicationManager.configure(config.connection);
		}

		// Localization Manager
		this._localizationManager = new HabboLocalizationManager(ctx);
		ctx.attachComponent(this._localizationManager, [IID_HabboLocalizationManager]);
		this._localizationManager.setConfigurationManager(this._configurationManager);
		this._localizationManager.setCommunicationManager(this._habboCommunicationManager);

		// Navigator (legacy)
		this._navigator = new HabboNavigator(ctx);
		ctx.attachComponent(this._navigator, [IID_HabboNavigator]);

		// New Navigator
		this._newNavigator = new HabboNewNavigator(ctx);
		ctx.attachComponent(this._newNavigator, [IID_HabboNewNavigator]);

		// Inventory
		this._inventory = new HabboInventory(ctx);
		ctx.attachComponent(this._inventory, [IID_HabboInventory]);

		// Room Engine
		this._roomEngine = new RoomEngine(ctx);
		ctx.attachComponent(this._roomEngine, [IID_RoomEngine]);

		// Room Message Handler - bridges communication to room engine
		this._roomMessageHandler = new RoomMessageHandler(this._roomEngine);
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

	/**
	 * Connect to the Habbo server
	 */
	public connect(): void
	{
		if (!this._habboCommunicationManager)
		{
			throw new Error('[Helium] Not initialized');
		}

		log.info('Connecting to server...');
		this._habboCommunicationManager.initConnection('habbo');

		// Connect RoomMessageHandler to the connection
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
	 */
	public dispose(): void
	{
		log.info('Disposing Helium...');

		// Dispose UI
		if (this._disposeUI)
		{
			this._disposeUI();
			this._disposeUI = null;
		}

		// Dispose module system
		this._moduleRegistry?.dispose();
		this._moduleRegistry = null;
		this._messageBus?.clear();
		this._messageBus = null;

		// Dispose core (disposes all components via context)
		this._core?.dispose();
		this._core = null;

		// Clear references
		this._configurationManager = null;
		this._habboCommunicationManager = null;
		this._localizationManager = null;
		this._navigator = null;
		this._newNavigator = null;
		this._inventory = null;
		this._roomMessageHandler?.dispose();
		this._roomMessageHandler = null;
		this._roomEngine?.dispose();
		this._roomEngine = null;

		this._ready = false;
	}

	// ========== Getters ==========

	get isReady(): boolean
	{
		return this._ready;
	}

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
}

export default Helium;
