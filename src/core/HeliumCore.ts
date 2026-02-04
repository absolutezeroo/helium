import {Application, ApplicationOptions, Ticker} from 'pixi.js';
import {ComponentContext} from '@core/runtime';
import {AssetLibrary} from '@core/assets/AssetLibrary';
import {CoreCommunicationManager} from '@core/communication/CoreCommunicationManager';
import {GameDataManager} from '@core/gamedata/GameDataManager';
import {Logger} from '@core/utils/Logger';
import {IID_AssetLibrary} from '@iid/IIDAssetLibrary';
import {IID_CoreCommunicationManager} from '@iid/IIDCoreCommunicationManager';
import {IID_GameDataManager} from '@iid/IIDGameDataManager';

import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IGameDataManager} from '@core/gamedata/IGameDataManager';

const log = Logger.getLogger('HeliumCore');

/**
 * HeliumCore configuration options
 */
export interface HeliumCoreConfig
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
}

/**
 * HeliumCore
 *
 * Core layer of the Helium engine. Contains fundamental components that are
 * not specific to Habbo and could be reused for other projects:
 * - ComponentContext (dependency injection)
 * - PixiJS Application
 * - AssetLibrary
 * - GameDataManager
 * - CoreCommunicationManager
 *
 * This layer is initialized first, before any Habbo-specific managers.
 */
export class HeliumCore
{
	private _ready: boolean = false;

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	// Core components
	private _context: ComponentContext | null = null;

	get context(): ComponentContext
	{
		if (!this._context)
		{
			throw new Error('[HeliumCore] Not initialized');
		}

		return this._context;
	}

	private _application: Application | null = null;

	get application(): Application
	{
		if (!this._application)
		{
			throw new Error('[HeliumCore] Not initialized');
		}

		return this._application;
	}

	private _assets: AssetLibrary | null = null;

	get assets(): IAssetLibrary
	{
		if (!this._assets)
		{
			throw new Error('[HeliumCore] Not initialized');
		}

		return this._assets;
	}

	private _gameData: GameDataManager | null = null;

	get gameData(): IGameDataManager
	{
		if (!this._gameData)
		{
			throw new Error('[HeliumCore] Not initialized');
		}

		return this._gameData;
	}

	private _communication: CoreCommunicationManager | null = null;

	get communication(): ICoreCommunicationManager
	{
		if (!this._communication)
		{
			throw new Error('[HeliumCore] Not initialized');
		}

		return this._communication;
	}

	get isReady(): boolean
	{
		return this._ready;
	}

	/**
	 * Initialize the core layer
	 */
	async init(config?: HeliumCoreConfig): Promise<void>
	{
		if (this._ready)
		{
			log.warn('Already initialized');
			return;
		}

		log.info('Initializing core...');

		// 1. Create Component Context (dependency injection container)
		this._context = new ComponentContext();

		// 2. Initialize PixiJS application
		this._application = new Application();

		const pixiOptions: Partial<ApplicationOptions> = {
			background: config?.background ?? '#000000',
			resizeTo: config?.resizeTo ?? window,
			antialias: config?.antialias ?? true,
			resolution: config?.resolution ?? window.devicePixelRatio,
			autoDensity: true,
		};

		await this._application.init(pixiOptions);

		// Append canvas to target
		const target = config?.canvas ?? document.body;
		target.appendChild(this._application.canvas);

		// 3. Create core components (order matters!)

		// Asset Library - manages all game assets
		this._assets = new AssetLibrary(this._context);
		this._context.attachComponent(this._assets, [IID_AssetLibrary]);

		// Game Data Manager - manages game data files
		this._gameData = new GameDataManager(this._context);
		this._context.attachComponent(this._gameData, [IID_GameDataManager]);

		// Core Communication Manager - low-level socket communication
		this._communication = new CoreCommunicationManager(this._context);
		this._context.attachComponent(this._communication, [IID_CoreCommunicationManager]);

		// 4. Set up update loop
		this._application.ticker.add(this.update, this);

		this._ready = true;
		log.info('Core initialized');
	}

	/**
	 * Dispose the core layer
	 */
	dispose(): void
	{
		if (this._disposed) return;

		log.info('Disposing core...');

		// Stop update loop
		this._application?.ticker.remove(this.update, this);

		// Dispose context (disposes all attached components)
		this._context?.dispose();
		this._context = null;

		// Dispose PixiJS
		this._application?.destroy(true);
		this._application = null;

		// Clear references
		this._assets = null;
		this._gameData = null;
		this._communication = null;

		this._disposed = true;
		this._ready = false;
	}

	/**
	 * Main update loop - updates context and communication
	 */
	private update(ticker: Ticker): void
	{
		if (this._disposed) return;

		const deltaTime = ticker.deltaMS;

		// Update context (processes all update receivers)
		this._context?.update(deltaTime);

		// Process communication queue
		this._communication?.update(deltaTime);
	}
}
