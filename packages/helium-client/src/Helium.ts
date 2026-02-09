import {Application} from 'pixi.js';
import {HeliumCore} from '@core/HeliumCore';
import {ComponentContext} from '@core/runtime';
import {HeliumMain} from './HeliumMain';
import {Logger} from '@core/utils/Logger';
import {mountUI} from './index.tsx';
import './_index.scss';
import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import type {RoomEngine} from '@habbo/room';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboNewNavigator} from '@habbo/navigator/IHabboNewNavigator';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {IHelium} from "./IHelium";
import {IHeliumCoreConfig} from "@core";

const log = Logger.getLogger('Helium');

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

	// UI
	private _disposeUI: (() => void) | null = null;

	// State
	private _ready: boolean = false;

	// Singleton
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

	// Core layer
	private _core: HeliumCore | null = null;

	get core(): HeliumCore
	{
		if (!this._core)
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

	get configuration(): IHabboConfigurationManager
	{
		return this._habboMain!.configurationManager;
	}

	get habboCommunication(): HabboCommunicationManager
	{
		return this._habboMain!.habboCommunication;
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
	 * Connect to the Habbo server
	 *
	 * Uses HabboCommunicationDemo (AS3 pattern) to manage the login flow:
	 * setSSOTicket → initGameSocket → initConnection → IncomingMessages → handshake
	 */
	connect(): void
	{
		if (!this._habboMain)
		{
			throw new Error('[Helium] Not initialized');
		}

		log.info('Connecting to server...');

		const demo = this._habboMain.communicationDemo;
		const comm = this._habboMain.habboCommunication;

		const ssoTicket = comm.ssoTicket;

		if (ssoTicket)
		{
			demo.setSSOTicket(ssoTicket);
		}
		else
		{
			demo.initGameSocket();
		}

		// Wire RoomMessageHandler to the connection (created in initConnection)
		const handler = this._habboMain.roomMessageHandler;

		if (comm.connection)
		{
			handler.connection = comm.connection;
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
	 * Order: UI → HabboMain (managers) → Core (context.dispose() disposes all Components)
	 */
	public dispose(): void
	{
		log.info('Disposing Helium...');

		// 1. Dispose UI
		this._disposeUI?.();
		this._disposeUI = null;

		// 2. Dispose engine orchestrator
		this._habboMain?.dispose();
		this._habboMain = null;

		// 3. Dispose core
		this._core?.dispose();
		this._core = null;

		this._ready = false;
	}

	// ── Private ──────────────────────────────────────────────────────

	/**
	 * Initialize the application
	 */
	async init(config?: IHeliumConfig): Promise<void>
	{
		log.info('Initializing Helium...');

		// 1. Create and init core
		this._core = new HeliumCore();
		await this._core.init(config);

		// 2. Create and init engine orchestrator
		this._habboMain = new HeliumMain();
		await this._habboMain.init(this._core, config);

		// 3. Mount UI
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
	 * Mount the SolidJS UI
	 */
	mountUI(): void
	{
		const uiContainer = document.createElement('div');

		uiContainer.id = 'helium-ui';

		document.body.appendChild(uiContainer);

		this._disposeUI = mountUI(uiContainer);
	}
}

export default Helium;
