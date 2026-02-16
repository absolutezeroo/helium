import {HabboConfigurationManager} from '@habbo/configuration/HabboConfigurationManager';
import {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import {HabboCommunicationDemo} from '@habbo/communication/demo/HabboCommunicationDemo';
import {HabboLocalizationManager} from '@habbo/localization/HabboLocalizationManager';
import {WindowParser} from '@core/window/utils/WindowParser';
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
import {AvatarRenderManager} from '@habbo/avatar/AvatarRenderManager';
import {HabboWindowManager} from '@habbo/window/HabboWindowManager';
import {HabboFriendBar} from '@habbo/friendbar/HabboFriendBar';
import {Logger} from '@core/utils/Logger';
import type {IHeliumConfig} from './Helium';
import {Helium} from './Helium';

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
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {HabboProperty} from '@habbo/configuration';

import type {HeliumCore} from '@core/HeliumCore';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IGameDataResources} from '@core/localization/IGameDataResources';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import {IID_HabboFriendBar} from '@iid/IIDHabboFriendBar';
import {IHeliumMain} from "./IHeliumMain";
import type {IHeliumLoadingScreen} from './IHeliumLoadingScreen';

const log = Logger.getLogger('HabboMain');

/**
 * Ratio of progress bar dedicated to core/SWF loading (0.0 to CORE_RATIO).
 * The remaining (CORE_RATIO to 1.0) is for initialization steps.
 *
 * @see sources/win63_2021_version/HabboAirMain.as line 31
 */
const CORE_RATIO = 0.6;

/**
 * Number of initialization steps for progress tracking in the [CORE_RATIO - 1.0] range:
 * 1. Configuration loaded
 * 2. Localization loaded
 * 3. All components ready (core running / COMPONENT_EVENT_RUNNING)
 *
 * @see sources/win63_2021_version/HabboAirMain.as line 32
 */
const INIT_STEPS = 3;


/**
 * HabboMain
 *
 * Engine orchestrator for the Habbo client.
 * Manages all Habbo-specific managers, module system, and localization.
 *
 * Follows the AS3 pattern where HabboAirMain.as orchestrates the engine
 * while HabboAir.as acts as the application shell.
 *
 * @see sources/win63_2021_version/HabboAirMain.as
 */
export class HeliumMain implements IHeliumMain
{
	private _core: HeliumCore | null = null;
	private _heartbeatTimer: ReturnType<typeof setInterval> | null = null;

	/**
	 * Loading screen reference.
	 *
	 * AS3: HabboAirMain receives _loadingScreen from HabboAir constructor.
	 * Calls _loadingScreen.updateLoadingBar(progress) during initialization.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as _loadingScreen
	 */
	private _loadingScreen: IHeliumLoadingScreen | null = null;

	/**
	 * Number of completed initialization steps.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as _completedInitSteps
	 */
	private _completedInitSteps: number = 0;

	/**
	 * Whether the room engine has finished initialization.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as _SafeStr_412
	 */
	private _roomEngineReady: boolean = false;

	/**
	 * Whether all core components are running.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as _SafeStr_413
	 */
	private _coreRunning: boolean = false;

	private _habboCommunicationManager: HabboCommunicationManager | null = null;
	private _localizationManager: HabboLocalizationManager | null = null;
	private _campaigns: HabboCampaigns | null = null;
	private _adManager: AdManager | null = null;
	private _tracking: HabboTracking | null = null;
	private _groupsManager: HabboGroupsManager | null = null;
	private _notifications: HabboNotifications | null = null;
	private _freeFlowChat: HabboFreeFlowChat | null = null;
	private _friendBar: HabboFriendBar | null = null;

	/**
	 * AS3: HabboAirMain(_arg_1:IHabboLoadingScreen, _arg_2:Dictionary)
	 *
	 * @param loadingScreen - Loading screen to update during initialization
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as constructor
	 */
	constructor(loadingScreen?: IHeliumLoadingScreen | null)
	{
		this._loadingScreen = loadingScreen ?? null;
	}

	private _toolbar: HabboToolbar | null = null;

	get toolbar(): IHabboToolbar
	{
		if (!this._toolbar)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._toolbar;
	}

	private _avatarRenderManager: AvatarRenderManager | null = null;

	get avatarRenderManager(): AvatarRenderManager
	{
		if (!this._avatarRenderManager)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._avatarRenderManager;
	}

	private _windowManager: HabboWindowManager | null = null;

	get windowManager(): IHabboWindowManager
	{
		if (!this._windowManager)
		{
			throw new Error('[HabboMain] Not initialized');
		}

		return this._windowManager;
	}

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
	 * Initialize the engine orchestrator.
	 *
	 * AS3 flow:
	 * 1. prepareCore() — create Core, register all components
	 * 2. addInitializationProgressListeners() — track config, localization, room engine, core running
	 * 3. initLocalization() — activate localization definition
	 *
	 * @param core - The HeliumCore instance (created by Helium shell)
	 * @param config - Optional Helium configuration
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as prepareCore()
	 */
	async init(core: HeliumCore, config?: IHeliumConfig): Promise<void>
	{
		this._core = core;

		await this.prepareCore(config);

		this.addInitializationProgressListeners();

		this.initLocalization();
	}

	/**
	 * Dispose engine resources
	 *
	 * Disposes module system.
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		log.info('Disposing HabboMain...');

		// Stop heartbeat
		if (this._heartbeatTimer !== null)
		{
			clearInterval(this._heartbeatTimer);
			this._heartbeatTimer = null;
		}

		// AS3: _loadingScreen.dispose() + _loadingScreen = null
		if (this._loadingScreen)
		{
			this._loadingScreen.dispose();
			this._loadingScreen = null;
		}

		// 1. Dispose RoomMessageHandler (not a Component, needs manual dispose)
		this._roomMessageHandler?.dispose();
		this._roomMessageHandler = null;

		// 3. Nullify Habbo manager refs (inverse init order)
		this._friendBar = null;
		this._windowManager = null;
		this._freeFlowChat = null;
		this._toolbar = null;
		this._notifications = null;
		this._groupsManager = null;
		this._tracking = null;
		this._adManager = null;
		this._campaigns = null;
		this._avatarRenderManager = null;
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
	 * Create Core and prepare all components.
	 *
	 * AS3: Creates Core instance, registers all component libraries via
	 * _core.prepareComponent(), then calls addInitializationProgressListeners().
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as prepareCore()
	 */
	async prepareCore(config?: IHeliumConfig): Promise<void>
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
		// AS3: HabboCommunicationDemo is a separate Component that orchestrates the connection.
		// In AS3, the SSO ticket comes from FlashVars (Dictionary passed to Core.instantiate()).
		// HabboCommunicationDemo.initComponent() checks _ssoTicket and calls initWithSSO()
		// which starts the connection. We must set the SSO ticket BEFORE DI resolves
		// (i.e., before initComponent() fires in a microtask) so that the connection
		// is created before other components try to use it.
		this._communicationDemo = new HabboCommunicationDemo(ctx);

		if (config?.connection?.ssoTicket)
		{
			this._communicationDemo.ssoTicket = config.connection.ssoTicket;
		}

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

		// 12a. Avatar Render Manager
		this._avatarRenderManager = new AvatarRenderManager(ctx);
		ctx.attachComponent(this._avatarRenderManager, [IID_AvatarRenderManager]);

		// 12b. Campaign Calendar
		this._campaigns = new HabboCampaigns(ctx);
		ctx.attachComponent(this._campaigns, []);

		// 12c. Advertisement Manager
		this._adManager = new AdManager(ctx);
		ctx.attachComponent(this._adManager, []);

		// 12d. Tracking
		this._tracking = new HabboTracking(ctx);
		ctx.attachComponent(this._tracking, [IID_HabboTracking]);

		// 12e. Groups Manager
		this._groupsManager = new HabboGroupsManager(ctx);
		ctx.attachComponent(this._groupsManager, []);

		// 12f. Notifications
		this._notifications = new HabboNotifications(ctx);
		ctx.attachComponent(this._notifications, []);

		// 12g. Toolbar
		this._toolbar = new HabboToolbar(ctx);
		ctx.attachComponent(this._toolbar, [IID_HabboToolbar]);

		// 12h. FreeFlowChat
		this._freeFlowChat = new HabboFreeFlowChat(ctx);
		ctx.attachComponent(this._freeFlowChat, []);

		// 12i. Window Manager
		this._windowManager = new HabboWindowManager(ctx);
		ctx.attachComponent(this._windowManager, [IID_HabboWindowManager]);

		// Set PixiJS stage on room engine for rendering
		this._roomEngine.setStage(this._core!.application.stage);

		// Wire DOM mouse events to room engine
		this._roomEngine.setCanvasElement(this._core!.application.canvas as HTMLCanvasElement);

		// 12. Room Message Handler - bridges communication to room engine
		this._roomMessageHandler = new RoomMessageHandler(this._roomEngine);

		// Wire RoomMessageHandler to the connection.
		// The connection is created by HabboCommunicationDemo.initComponent() which fires
		// as a microtask. We yield here so all component initComponent() microtasks complete,
		// then wire the handler to the now-existing connection.
		await Promise.resolve();

		if (this._habboCommunicationManager.connection)
		{
			this._roomMessageHandler.connection = this._habboCommunicationManager.connection;
			this._roomEngine.connection = this._habboCommunicationManager.connection;
		}

	}

	/**
	 * Initialize the Friend Bar (landing view, friend bar view, etc.)
	 *
	 * Must be called AFTER window layouts are registered by the client layer,
	 * because the landing view builds its window from a registered layout.
	 *
	 * @see sources/win63_version/habbo/friendbar/HabboFriendBar.as
	 */
	initFriendBar(): void
	{
		const ctx = this._core!.context;

		this._friendBar = new HabboFriendBar(ctx);
		ctx.attachComponent(this._friendBar, [IID_HabboFriendBar]);

		log.info('Friend Bar initialized');
	}

	/**
	 * Called when game data resources (hashes) are available.
	 * Sets config properties from hashes for game data loading.
	 */
	async onGameDataResourcesReady(resources: IGameDataResources): Promise<void>
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

		if (resources.habboAvatarAnimationsUrl && resources.habboAvatarAnimationsHash)
		{
			config.setProperty('avatar.animations.url', `${resources.habboAvatarAnimationsUrl}/${resources.habboAvatarAnimationsHash}`);
		}

		if (resources.habboAvatarGeometryUrl && resources.habboAvatarGeometryHash)
		{
			config.setProperty('avatar.geometry.url', `${resources.habboAvatarGeometryUrl}/${resources.habboAvatarGeometryHash}`);
		}

		if (resources.habboAvatarPartSetsUrl && resources.habboAvatarPartSetsHash)
		{
			config.setProperty('avatar.partsets.url', `${resources.habboAvatarPartSetsUrl}/${resources.habboAvatarPartSetsHash}`);
		}

		// Trigger furnidata/productdata loading now that URLs are available
		if (this._sessionDataManager)
		{
			this._sessionDataManager.onConfigurationComplete();
		}

		// Trigger avatar resource loading now that hash-based URLs are available
		if (this._avatarRenderManager)
		{
			this._avatarRenderManager.onGameDataReady();

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
	async loadExternalUIVariables(url: string): Promise<void>
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
			}
			else
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
		}
		catch (error)
		{
			log.warn(`Failed to load external UI variables: ${error}`);
		}
	}

	/**
	 * Initialize localization.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as (inline in prepareCore)
	 */
	initLocalization(): void
	{
		if (this._configurationManager!.propertyExists('localization.1'))
		{
			const locName = this._configurationManager!.getProperty('localization.1');

			this._localizationManager!.activateLocalizationDefinition(locName);
		}
	}

	// ── Initialization progress listeners (AS3: HabboAirMain) ────────

	/**
	 * Set up listeners to track initialization progress of key components.
	 *
	 * AS3 listens for:
	 * - IIDHabboConfigurationManager → onConfigurationComplete
	 * - IIDHabboLocalizationManager → events "complete" → onLocalizationComplete
	 * - IIDRoomEngine → events "REE_ENGINE_INITIALIZED" → onRoomEngineReady
	 * - _core.events "COMPONENT_EVENT_RUNNING" → onCoreRunning
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as addInitializationProgressListeners()
	 */
	private addInitializationProgressListeners(): void
	{
		// AS3: simpleQueueInterface(new IIDHabboConfigurationManager(), onConfigurationComplete)
		// Configuration is already loaded (we awaited initConfigurationDownload in prepareCore)
		this.onConfigurationComplete();

		// AS3: simpleQueueInterface(new IIDHabboLocalizationManager(), cb → events.addEventListener("complete", onLocalizationComplete))
		if (this._localizationManager)
		{
			this._localizationManager.events.on('complete', () => this.onLocalizationComplete());
		}

		// AS3: simpleQueueInterface(new IIDRoomEngine(), cb → events.addEventListener("REE_ENGINE_INITIALIZED", onRoomEngineReady))
		if (this._roomEngine)
		{
			this._roomEngine.events.on('REE_ENGINE_INITIALIZED', () => this.onRoomEngineReady());
		}

		// AS3: _core.events.addEventListener("COMPONENT_EVENT_RUNNING", onCoreRunning)
		// In our system, all components are ready after prepareCore + microtask flush.
		// We trigger this after the current microtask completes.
		queueMicrotask(() => this.onCoreRunning());
	}

	/**
	 * Update the loading bar progress.
	 *
	 * Progress formula: CORE_RATIO + (completedInitSteps / INIT_STEPS) * (1 - CORE_RATIO)
	 * Maps init steps to the [0.6 - 1.0] range.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as updateProgressBar()
	 */
	private updateProgressBar(): void
	{
		if (this._loadingScreen != null)
		{
			const progress = CORE_RATIO + ((this._completedInitSteps / INIT_STEPS) * (1 - CORE_RATIO));

			this._loadingScreen.updateLoadingBar(progress);
		}
	}

	/**
	 * Called when the configuration manager has loaded.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as onConfigurationComplete()
	 */
	private onConfigurationComplete(): void
	{
		Helium.trackLoginStep('client.init.config.loaded');
		this._completedInitSteps++;
		this.updateProgressBar();
	}

	/**
	 * Called when the localization manager has finished loading.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as onLocalizationComplete()
	 */
	private onLocalizationComplete(): void
	{
		Helium.trackLoginStep('client.init.localization.loaded');

		// Wire localization resolver for WindowParser.
		if (this._localizationManager)
		{
			const locMgr = this._localizationManager;

			WindowParser.localizationResolver = (key: string) =>
			{
				const value = locMgr.getLocalization(key, '');

				return value !== '' ? value : null;
			};
		}

		this._completedInitSteps++;
		this.updateProgressBar();
	}

	/**
	 * Called when the room engine has finished initialization.
	 *
	 * AS3: Sets _SafeStr_412 = true, starts heartbeat if spaweb=1.
	 * When both _roomEngineReady and _coreRunning are true, the init is complete.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as onRoomEngineReady()
	 */
	private onRoomEngineReady(): void
	{
		this._roomEngineReady = true;
		Helium.trackLoginStep('client.init.room.ready');

		this.startSendingHeartBeat();
	}

	/**
	 * Called when all core components are running.
	 *
	 * AS3: Sets _SafeStr_413 = true, increments completedInitSteps.
	 * When both _roomEngineReady and _coreRunning are true, the init is complete.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as onCoreRunning()
	 */
	private onCoreRunning(): void
	{
		this._coreRunning = true;
		Helium.trackLoginStep('client.init.core.running');
		this._completedInitSteps++;
		this.updateProgressBar();
	}

	/**
	 * Start sending heartbeat at regular intervals.
	 *
	 * AS3: If config "spaweb=1", sends heartbeat every 10 seconds
	 * via HabboWebTools to keep the session alive.
	 *
	 * @see sources/win63_2021_version/HabboAirMain.as startSendingHeartBeat()
	 */
	private startSendingHeartBeat(): void
	{
		const config = this._configurationManager;

		if (!config) return;

		const spaweb = config.propertyExists('spaweb')
			? config.getProperty('spaweb')
			: '0';

		if (spaweb === '1')
		{
			log.info('SPA heartbeat enabled');

			this.sendHeartBeat();

			this._heartbeatTimer = setInterval(() =>
			{
				this.sendHeartBeat();
			}, 10000);
		}
	}

	/**
	 * Send a heartbeat signal.
	 *
	 * Emits a 'heartbeat' event on the Helium instance.
	 * The client can listen to POST this to a server endpoint.
	 *
	 * @see sources/win63_version/Habbo.as sendHeartBeat()
	 */
	private sendHeartBeat(): void
	{
		Helium.instance.heliumEvents.emit('heartbeat');
	}

	/**
	 * Handle a core component error.
	 *
	 * @see sources/win63_version/HabboMain.as onCoreError()
	 */
	private onCoreError(message: string): void
	{
		log.error(`Core error: ${message}`);

		Helium.reportCrash(message, 'core', false);
	}

	/**
	 * Handle a core component reboot request.
	 *
	 * @see sources/win63_version/HabboMain.as onCoreReboot()
	 */
	private onCoreReboot(): void
	{
		log.warn('Core reboot requested');

		Helium.instance.heliumEvents.emit('reboot');
	}
}
