import {EventEmitter} from 'eventemitter3';
import {Application} from 'pixi.js';
import {HeliumCore} from '@core/HeliumCore';
import {ComponentContext} from '@core/runtime';
import {HeliumMain} from './HeliumMain';
import {Logger} from '@core/utils/Logger';
import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import type {RoomEngine} from '@habbo/room';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboNewNavigator} from '@habbo/navigator/IHabboNewNavigator';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import {IHelium} from "./IHelium";
import {IHeliumCoreConfig} from "@core";

const log = Logger.getLogger('Helium');

/**
 * Number of initialization steps for progress tracking.
 *
 * AS3 uses 3 steps for the [0.6 - 1.0] range:
 * 1. Configuration loaded
 * 2. Localization loaded
 * 3. All components ready (core running)
 */
const INIT_STEPS = 3;

/**
 * Connection configuration
 */
export interface IConnectionConfig
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
export interface IHeliumConfig extends IHeliumCoreConfig
{
	/** Connection configuration */
	connection?: IConnectionConfig;

	/** URL to load external configuration from (external_variables.txt) */
	configurationUrl?: string;

	/** Configuration object (alternative to URL) */
	configuration?: Record<string, string>;

	/** Allow arbitrary configuration properties at the top level */
	[key: string]: unknown;
}

/**
 * Crash report data
 */
export interface ICrashReport
{
	message: string;
	category: string;
	isFatal: boolean;
	timestamp: number;
	error?: Error;
}

/**
 * Helium
 *
 * Application shell for the Helium Habbo client.
 * Owns HeliumCore (engine fundamentals) and HabboMain (engine orchestrator).
 * Handles singleton lifecycle, UI mounting, and connection management.
 *
 * Follows the AS3 pattern where Habbo.as is the entry shell
 * and HabboMain.as is the engine orchestrator.
 *
 * @see source_as_win63/habbo/Habbo.as
 */
export class Helium implements IHelium
{
	// Engine orchestrator
	private _habboMain: HeliumMain | null = null;

	// State
	private _ready: boolean = false;
	private _completedInitSteps: number = 0;

	// Event emitter for progress, ready, crash, unload, heartbeat
	private _events: EventEmitter = new EventEmitter();

	// Unload handler reference for cleanup
	private _unloadHandler: (() => void) | null = null;

	// Singleton
	private static _instance: Helium;

	/**
	 * Get the singleton instance
	 */
	public static get instance(): Helium
	{
		if(!this._instance)
		{
			this._instance = new Helium();
		}

		return this._instance;
	}

	// Core layer
	private _core: HeliumCore | null = null;

	get core(): HeliumCore
	{
		if(!this._core)
		{
			throw new Error('[Helium] Not initialized');
		}

		return this._core;
	}

	protected _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	get context(): ComponentContext
	{
		return this.core.context;
	}

	get application(): Application
	{
		return this.core.application;
	}

	get communication(): ICoreCommunicationManager
	{
		return this.core.communication;
	}

	get isReady(): boolean
	{
		return this._ready;
	}

	/**
	 * Event emitter for lifecycle events.
	 *
	 * Events:
	 * - `'progress'` (progress: number) — 0.0 to 1.0
	 * - `'ready'` — all components initialized
	 * - `'crash'` (report: ICrashReport) — error occurred
	 * - `'unload'` — browser unloading
	 * - `'heartbeat'` — periodic heartbeat (SPA mode)
	 */
	get heliumEvents(): EventEmitter
	{
		return this._events;
	}

	get configuration(): IHabboConfigurationManager
	{
		return this._habboMain!.configurationManager;
	}

	get habboCommunication(): HabboCommunicationManager
	{
		return this._habboMain!.habboCommunication;
	}

	get avatarRenderManager(): IAvatarRenderManager
	{
		return this._habboMain!.avatarRenderManager;
	}

	get roomEngine(): RoomEngine
	{
		return this._habboMain!.roomEngine;
	}

	get sessionDataManager(): ISessionDataManager
	{
		return this._habboMain!.sessionDataManager;
	}

	get roomSessionManager(): IRoomSessionManager
	{
		return this._habboMain!.roomSessionManager;
	}

	get navigator(): IHabboNavigator
	{
		return this._habboMain!.navigator;
	}

	get newNavigator(): IHabboNewNavigator
	{
		return this._habboMain!.newNavigator;
	}

	get inventory(): IHabboInventory
	{
		return this._habboMain!.inventory;
	}

	get localization(): IHabboLocalizationManager
	{
		return this._habboMain!.localization;
	}

	get windowManager(): IHabboWindowManager
	{
		return this._habboMain!.windowManager;
	}

	get toolbar(): IHabboToolbar
	{
		return this._habboMain!.toolbar;
	}

	/**
	 * Bootstrap the application
	 */
	public static async bootstrap(config?: IHeliumConfig): Promise<Helium>
	{
		const instance = this.instance;

		await instance.init(config);

		return instance;
	}

	/**
	 * Track a login step for analytics and debugging.
	 *
	 * @see sources/win63_version/Habbo.as trackLoginStep()
	 */
	public static trackLoginStep(step: string, extra?: string): void
	{
		const message = extra ? `${step} (${extra})` : step;

		log.debug(`Login step: ${message}`);

		if(this._instance)
		{
			this._instance._events.emit('loginStep', step, extra);
		}
	}

	/**
	 * Report a crash or error.
	 *
	 * @see sources/win63_version/Habbo.as reportCrash()
	 */
	public static reportCrash(message: string, category: string, isFatal: boolean, error?: Error): void
	{
		const report: ICrashReport = {
			message,
			category,
			isFatal,
			timestamp: Date.now(),
			error,
		};

		log.error(`Crash [${category}]: ${message}${isFatal ? ' (FATAL)' : ''}`);

		if(error)
		{
			log.error(error.stack ?? error.message);
		}

		if(this._instance)
		{
			this._instance._events.emit('crash', report);
		}
	}

	/**
	 * Connect to the Habbo server
	 *
	 * Uses HabboCommunicationDemo (AS3 pattern) to manage the login flow:
	 * setSSOTicket → initGameSocket → initConnection → IncomingMessages → handshake
	 */
	connect(): void
	{
		if(!this._habboMain)
		{
			throw new Error('[Helium] Not initialized');
		}

		log.info('Connecting to server...');

		const demo = this._habboMain.communicationDemo;
		const comm = this._habboMain.habboCommunication;

		const ssoTicket = comm.ssoTicket;

		if(ssoTicket)
		{
			demo.setSSOTicket(ssoTicket);
		}
		else
		{
			demo.initGameSocket();
		}

		// Wire RoomMessageHandler to the connection (created in initConnection)
		const handler = this._habboMain.roomMessageHandler;

		if(comm.connection)
		{
			handler.connection = comm.connection;
			this._habboMain.roomEngine.connection = comm.connection;
		}
	}

	/**
	 * Disconnect from the server
	 */
	disconnect(): void
	{
		this._habboMain?.habboCommunication.disconnect();
	}

	/**
	 * Dispose the application
	 *
	 * Order: HabboMain (managers) → Core (context.dispose() disposes all Components)
	 *
	 * @see sources/win63_version/Habbo.as
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		log.info('Disposing Helium...');

		// Remove unload listener
		if(this._unloadHandler)
		{
			window.removeEventListener('beforeunload', this._unloadHandler);
			this._unloadHandler = null;
		}

		// 1. Dispose engine orchestrator
		this._habboMain?.dispose();
		this._habboMain = null;

		// 2. Dispose core
		this._core?.dispose();
		this._core = null;

		this._ready = false;

		this._events.removeAllListeners();
	}

	/**
	 * Initialize the application
	 *
	 * @see sources/win63_version/Habbo.as
	 */
	async init(config?: IHeliumConfig): Promise<void>
	{
		if(this._ready)
		{
			log.warn('Already initialized');
			return;
		}

		Helium.trackLoginStep('client.init.start');

		try
		{
			log.info('Initializing Helium...');

			this._completedInitSteps = 0;
			this.emitProgress();

			// 1. Create and init core
			this._core = new HeliumCore();

			await this._core.init(config);

			Helium.trackLoginStep('client.init.config.loaded');
			this.completeInitStep();

			// 2. Create and init engine orchestrator
			this._habboMain = new HeliumMain();

			await this._habboMain.init(this._core, config);

			Helium.trackLoginStep('client.init.localization.loaded');
			this.completeInitStep();

			// 3. All components ready
			Helium.trackLoginStep('client.init.core.running');
			this.completeInitStep();

			this._ready = true;

			// Register unload handler
			this._unloadHandler = () =>
			{
				this._events.emit('unload');
				this.dispose();
			};
			window.addEventListener('beforeunload', this._unloadHandler);

			this._events.emit('ready');

			log.success('Ready!');

			// Auto-connect if configured (non-fatal — engine is already ready)
			if(config?.connection?.autoConnect)
			{
				try
				{
					this.connect();
				}
				catch(connectError)
				{
					Helium.reportCrash(
						connectError instanceof Error ? connectError.message : String(connectError),
						'connect',
						false,
						connectError instanceof Error ? connectError : undefined
					);
				}
			}
		}
		catch(error)
		{
			Helium.trackLoginStep('client.init.core.fail');
			Helium.reportCrash(
				error instanceof Error ? error.message : String(error),
				'init',
				true,
				error instanceof Error ? error : undefined
			);

			throw error;
		}
	}

	/**
	 * Complete one initialization step and emit progress.
	 */
	private completeInitStep(): void
	{
		this._completedInitSteps++;
		this.emitProgress();
	}

	/**
	 * Emit progress event.
	 *
	 * AS3 maps [0.0-0.6] to SWF loading (not applicable), [0.6-1.0] to init steps.
	 * We use the full [0.0-1.0] range for init steps.
	 */
	private emitProgress(): void
	{
		const progress = Math.min(this._completedInitSteps / INIT_STEPS, 1.0);

		this._events.emit('progress', progress);
	}
}
