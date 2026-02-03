import {Application, Ticker} from 'pixi.js';
import {ComponentContext} from '@core/runtime';
import {AssetLibrary} from '@core/assets/AssetLibrary';
import {CoreCommunicationManager} from '@core/communication/CoreCommunicationManager';
import {GameDataManager} from '@core/gamedata/GameDataManager';
import {HabboConfigurationManager} from '@habbo/configuration/HabboConfigurationManager';
import {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import {HabboLocalizationManager} from '@habbo/localization/HabboLocalizationManager';
import {HabboNavigator} from '@habbo/navigator/HabboNavigator';
import {HabboNewNavigator} from '@habbo/navigator/HabboNewNavigator';
import {HabboInventory} from '@habbo/inventory/HabboInventory';
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
import {IID_AssetLibrary} from "@iid/IIDAssetLibrary";
import {IID_CoreCommunicationManager} from "@iid/IIDCoreCommunicationManager";
import {IID_GameDataManager} from "@iid/IIDGameDataManager";
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {IID_HabboConfigurationManager} from "@iid/IIDHabboConfigurationManager";
import {IID_HabboLocalizationManager} from "@iid/IIDHabboLocalizationManager";
import {IID_HabboNavigator} from "@iid/IIDHabboNavigator";
import {IID_HabboNewNavigator} from "@iid/IIDHabboNewNavigator";
import {IID_HabboInventory} from "@iid/IIDHabboInventory";

const log = Logger.getLogger('Helium');

export class Helium
{
	private _ready = false;
	// Managers
	private _configurationManager: IHabboConfigurationManager | null = null;
	private _communicationManager: ICoreCommunicationManager | null = null;
	private _habboCommunicationManager: HabboCommunicationManager | null = null;
	// UI
	private _disposeUI: (() => void) | null = null;

	private static _instance: Helium;

	public static get instance(): Helium
	{
		if (!this._instance)
		{
			this._instance = new Helium();
		}

		return this._instance;
	}

	// Component Context
	private _context: ComponentContext | null = null;

	/**
	 * Get the component context
	 */
	public get context(): ComponentContext
	{
		if (!this._context)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._context;
	}

	// Module System
	private _messageBus: MessageBus | null = null;

	/**
	 * Get the message bus
	 */
	public get messageBus(): MessageBus
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
	public get moduleRegistry(): ModuleRegistry
	{
		if (!this._moduleRegistry)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._moduleRegistry;
	}

	private _application: Application | null = null;

	public get application(): Application
	{
		if (!this._application)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._application;
	}

	public get isReady(): boolean
	{
		return this._ready;
	}

	/**
	 * Get the configuration manager
	 */
	public get configuration(): IHabboConfigurationManager
	{
		if (!this._configurationManager)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._configurationManager;
	}

	/**
	 * Get the core communication manager
	 */
	public get communication(): ICoreCommunicationManager
	{
		if (!this._communicationManager)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._communicationManager;
	}

	/**
	 * Get the Habbo communication manager
	 */
	public get habboCommunication(): HabboCommunicationManager
	{
		if (!this._habboCommunicationManager)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._habboCommunicationManager;
	}

	public static async bootstrap(config?: HeliumConfig): Promise<Helium>
	{
		const instance = this.instance;

		await instance.init(config);

		return instance;
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
	}

	/**
	 * Disconnect from the server
	 */
	public disconnect(): void
	{
		this._habboCommunicationManager?.disconnect();
	}

	public dispose(): void
	{
		// Stop update loop
		this._application?.ticker.remove(this.update, this);

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

		// Dispose context (disposes all components)
		this._context?.dispose();
		this._context = null;

		// Dispose PixiJS
		this._application?.destroy(true);
		this._application = null;

		this._configurationManager = null;
		this._communicationManager = null;
		this._habboCommunicationManager = null;
		this._ready = false;
	}

	private async init(config?: HeliumConfig): Promise<void>
	{
		log.info('Initializing...');

		// Create Component Context (replaces Inversify container)
		this._context = new ComponentContext();

		// ========== Create Core Components ==========

		// Asset Library
		const assetLibrary = new AssetLibrary(this._context);
		this._context.attachComponent(assetLibrary, [IID_AssetLibrary]);

		// Game Data Manager
		const gameDataManager = new GameDataManager(this._context);
		this._context.attachComponent(gameDataManager, [IID_GameDataManager]);

		// Core Communication Manager
		const coreCommunicationManager = new CoreCommunicationManager(this._context);
		this._context.attachComponent(coreCommunicationManager, [IID_CoreCommunicationManager]);
		this._communicationManager = coreCommunicationManager;

		// ========== Create Habbo Components ==========

		// Configuration Manager
		const configurationManager = new HabboConfigurationManager(this._context);
		this._context.attachComponent(configurationManager, [IID_HabboConfigurationManager]);
		this._configurationManager = configurationManager;

		// Set configuration properties
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

		// Load external configuration
		await this._configurationManager.initConfigurationDownload();

		// Initialize PixiJS application
		this._application = new Application();

		await this._application.init({
			background: config?.background ?? '#000000',
			resizeTo: config?.resizeTo ?? window,
			antialias: config?.antialias ?? true,
			resolution: config?.resolution ?? window.devicePixelRatio,
			autoDensity: true,
		});

		const target = config?.canvas ?? document.body;

		target.appendChild(this._application.canvas);

		// Habbo Communication Manager (depends on CoreCommunicationManager)
		const habboCommunicationManager = new HabboCommunicationManager(this._context);
		this._context.attachComponent(habboCommunicationManager, [IID_HabboCommunicationManager]);
		this._habboCommunicationManager = habboCommunicationManager;

		// Configure connection if provided
		if (config?.connection)
		{
			this._habboCommunicationManager.configure(config.connection);
		}

		// ========== Initialize Module System ==========

		// Create MessageBus
		this._messageBus = new MessageBus();

		// Add logging middleware in development
		if (import.meta.env.DEV)
		{
			this._messageBus.use(loggingMiddleware);
		}

		// Create ModuleRegistry
		this._moduleRegistry = new ModuleRegistry(this._context, this._messageBus);

		// Connect MessageBus to HabboCommunicationManager
		this._habboCommunicationManager.onMessage((event) =>
		{
			this._messageBus!.dispatch(event);
		});

		// ========== Register Modules (no manager deps) ==========
		await this._moduleRegistry.register(sessionModule);
		await this._moduleRegistry.register(connectionModule);
		await this._moduleRegistry.register(roomModule);
		await this._moduleRegistry.register(favouritesModule);

		// Wire connection actions to HabboCommunicationManager
		const connectionActions = this._moduleRegistry.get(ModuleId.Connection).actions;
		this._habboCommunicationManager.setConnectionActions(connectionActions);

		// ========== Create Remaining Managers ==========

		// Localization Manager
		const localizationManager = new HabboLocalizationManager(this._context);
		this._context.attachComponent(localizationManager, [IID_HabboLocalizationManager]);
		localizationManager.setConfigurationManager(this._configurationManager);
		localizationManager.setCommunicationManager(this._habboCommunicationManager);

		// Navigator (depends on HabboCommunicationManager)
		const navigatorManager = new HabboNavigator(this._context);
		this._context.attachComponent(navigatorManager, [IID_HabboNavigator]);

		// New Navigator (depends on HabboCommunicationManager and HabboNavigator)
		const newNavigatorManager = new HabboNewNavigator(this._context);
		this._context.attachComponent(newNavigatorManager, [IID_HabboNewNavigator]);

		// Inventory Manager
		const inventoryManager = new HabboInventory(this._context);
		this._context.attachComponent(inventoryManager, [IID_HabboInventory]);

		// ========== Register Modules (with manager deps) ==========
		await this._moduleRegistry.register(configModule);
		await this._moduleRegistry.register(localizationModule);
		await this._moduleRegistry.register(navigatorModule);
		await this._moduleRegistry.register(inventoryModule);

		// ========== Final Initialization ==========

		// Activate default localization if configured
		if (this._configurationManager.propertyExists('localization.1'))
		{
			const locName = this._configurationManager.getProperty('localization.1');
			localizationManager.activateLocalizationDefinition(locName);
		}

		// Mount SolidJS UI with ModuleRegistry
		const uiContainer = document.createElement('div');
		uiContainer.id = 'helium-ui';
		document.body.appendChild(uiContainer);
		this._disposeUI = mountUI(uiContainer, this._moduleRegistry);

		// Set up update loop for communication
		this._application.ticker.add(this.update, this);

		this._ready = true;
		log.success('Ready!');

		// Auto-connect if configured
		if (config?.connection?.autoConnect)
		{
			this.connect();
		}
	}

	/**
	 * Main update loop
	 */
	private update(ticker: Ticker): void
	{
		const deltaTime = ticker.deltaMS;

		// Update context (processes all update receivers)
		this._context?.update(deltaTime);

		// Process communication
		this._communicationManager?.update(deltaTime);
	}
}

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
export interface HeliumConfig
{
	/** Background color */
	background?: string;
	/** Element to resize to */
	resizeTo?: HTMLElement | Window;
	/** Enable antialiasing */
	antialias?: boolean;
	/** Pixel resolution */
	resolution?: number;
	/** Canvas container element */
	canvas?: HTMLElement;
	/** Connection configuration */
	connection?: ConnectionConfig;
	/** URL to load external configuration from (external_variables.txt) */
	configurationUrl?: string;
	/** Configuration object (alternative to URL) */
	configuration?: Record<string, string>;
}

export default Helium;
