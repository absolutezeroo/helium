import {Application, ApplicationOptions, Ticker} from 'pixi.js';
import {CoreComponentContext, CoreSetup} from '@core/runtime/CoreComponentContext';
import {Core} from '@core/Core';
import {AssetLibrary} from '@core/assets/AssetLibrary';
import {CoreCommunicationManager} from '@core/communication/CoreCommunicationManager';
import {Logger} from '@core/utils/Logger';
import {IID_AssetLibrary} from '@iid/IIDAssetLibrary';
import {IID_CoreCommunicationManager} from '@iid/IIDCoreCommunicationManager';
import {IID_Core} from '@iid/IIDCore';

import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IHeliumCore, IHeliumCoreConfig} from '@core/IHeliumCore';

const log = Logger.getLogger('HeliumCore');

/**
 * HeliumCore
 *
 * Core layer of the Helium engine. Contains fundamental components that are
 * not specific to Habbo and could be reused for other projects:
 * - CoreComponentContext (DI container with priority update loop)
 * - PixiJS Application
 * - AssetLibrary
 * - CoreCommunicationManager
 *
 * This layer is initialized first, before any Habbo-specific managers.
 *
 * Uses CoreComponentContext (AS3 equivalent) instead of plain ComponentContext,
 * providing 3-tier priority update loop, hibernation, and reboot support.
 */
export class HeliumCore implements IHeliumCore
{
	private _ready: boolean = false;

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	// Core components
	private _context: CoreComponentContext | null = null;

	get context(): CoreComponentContext
	{
		if(!this._context)
		{
			throw new Error('[HeliumCore] Not initialized');
		}

		return this._context;
	}

	private _application: Application | null = null;

	get application(): Application
	{
		if(!this._application)
		{
			throw new Error('[HeliumCore] Not initialized');
		}

		return this._application;
	}

	private _assets: AssetLibrary | null = null;

	get assets(): IAssetLibrary
	{
		if(!this._assets)
		{
			throw new Error('[HeliumCore] Not initialized');
		}

		return this._assets;
	}

	private _communication: CoreCommunicationManager | null = null;

	get communication(): ICoreCommunicationManager
	{
		if(!this._communication)
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
	async init(config?: IHeliumCoreConfig): Promise<void>
	{
		if(this._ready)
		{
			log.warn('Already initialized');
			return;
		}

		log.info('Initializing core...');

		// 1. Create CoreComponentContext (full DI container with priority update loop)
		//    This is the AS3 CoreComponentContext equivalent — manages all components,
		//    update receivers with 3-tier priority, hibernation, and reboot.
		this._context = Core.instantiate(
			CoreSetup.FRAME_UPDATE_SIMPLE
		) as CoreComponentContext;

		// Set target FPS (will be updated from ticker)
		this._context.targetFps = 60;

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

		// Update target FPS from ticker
		this._context.targetFps = this._application.ticker.maxFPS || 60;

		// 3. Register core itself as IID_Core so components can depend on it
		this._context.registerInterface(IID_Core, this._context);

		// 4. Create core components (order matters!)

		// Asset Library - manages all game assets
		this._assets = new AssetLibrary(this._context);
		this._context.attachComponent(this._assets, [IID_AssetLibrary]);

		// Core Communication Manager - low-level socket communication
		this._communication = new CoreCommunicationManager(this._context);
		this._context.attachComponent(this._communication, [IID_CoreCommunicationManager]);

		// 5. Set up update loop — PixiJS ticker drives the CoreComponentContext
		this._application.ticker.add(this.update, this);

		// 6. Initialize the core (waits for locked components, then emits RUNNING)
		this._context.initialize();

		this._ready = true;
		log.info('Core initialized');
	}

	/**
	 * Dispose the core layer
	 */
	dispose(): void
	{
		if(this._disposed) return;

		log.info('Disposing core...');

		// Stop update loop
		this._application?.ticker.remove(this.update, this);

		// Dispose via Core singleton (cleans up context and all components)
		Core.dispose();
		this._context = null;

		// Dispose PixiJS
		this._application?.destroy(true);
		this._application = null;

		// Clear references
		this._assets = null;
		this._communication = null;

		this._disposed = true;
		this._ready = false;
	}

	/**
	 * Main update loop — PixiJS ticker calls this each frame.
	 *
	 * Delegates to CoreComponentContext.update() which handles
	 * priority-based update receivers, hibernation throttling, and reboot.
	 */
	update(ticker: Ticker): void
	{
		if(this._disposed) return;

		const deltaTime = ticker.deltaMS;

		// CoreComponentContext.update() handles the full priority update loop
		// including all registered update receivers and hibernation.
		this._context?.update(deltaTime);

		// Process communication queue
		// TODO: CoreCommunicationManager should register as an update receiver
		// instead of being called separately.
		this._communication?.update(deltaTime);
	}
}
