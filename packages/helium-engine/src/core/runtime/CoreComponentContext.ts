import type {IUpdateReceiver} from './IContext';
import type {ICore} from './ICore';
import type {ICoreErrorReporter} from './ICoreErrorReporter';
import type {ICoreErrorLogger} from './ICoreErrorLogger';
import {ComponentContext} from './ComponentContext';
import {ComponentEvents} from './Component';
import {DefaultErrorReporter} from './DefaultErrorReporter';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('CoreComponentContext');

/**
 * Number of update receiver priority levels.
 *
 * Level 0 = highest priority (always runs)
 * Level 1 = can skip frames if behind
 * Level 2 = lowest priority (most frame skipping)
 */
const NUM_UPDATE_RECEIVER_LEVELS = 3;

/**
 * Core setup constants — determines which frame update handler is used.
 *
 * @see sources/win63_version/core/class_79.as
 */
export const CoreSetup =
	{
		/** Simple update loop — iterates all receivers every frame */
		FRAME_UPDATE_SIMPLE: 0,

		/** Complex update loop — time-sliced, skips lower priority when behind */
		FRAME_UPDATE_COMPLEX: 1,

		/** Profiler update loop — wraps updates with profiler timing */
		FRAME_UPDATE_PROFILER: 2,

		/** Experimental update loop — per-receiver frame skipping via UpdateDelegate */
		FRAME_UPDATE_EXPERIMENT: 4,

		/** Bitmask for extracting frame update mode from setup flags */
		FRAME_UPDATE_MASK: 15,

		/** Debug mode — all features enabled */
		DEBUG: 15,
	} as const;

/**
 * Core Component Context
 *
 * The top-level runtime context. Extends ComponentContext with:
 * - 3-tier priority update loop (simple, complex, experimental, debug modes)
 * - Hibernation system (reduced update frequency)
 * - Reboot mechanism
 * - Error reporting delegation
 * - Library loading pipeline (adapted for fetch-based web loading)
 *
 * In AS3 this was the root context created by Core.instantiate().
 * In TypeScript, HeliumCore creates this as the root context.
 *
 * @see sources/win63_version/core/runtime/CoreComponentContext.as
 */
export class CoreComponentContext extends ComponentContext implements ICore
{
	/** Update receivers organized by priority level */
	private _updateReceiversByPriority: (IUpdateReceiver | null)[][] = [];

	/** Frame skip counters per priority level */
	private _frameSkipCounters: number[] = [];

	/** The active frame update handler function */
	private _frameUpdateHandler: (timeMs: number, deltaMs: number) => void;

	/** Error reporter */
	private _errorReporter: ICoreErrorReporter;

	/** Timestamp of the last update */
	private _lastUpdateTimeMs: number = 0;

	/** Core setup flags */
	private _setupFlags: number = 0;

	/** Hibernation priority level (-1 = not hibernating) */
	private _hibernationLevel: number = -1;

	/** Hibernation update frequency in ms */
	private _hibernationUpdateFrequency: number = 0;

	/** Whether to reboot on next frame */
	private _rebootOnNextFrame: boolean = false;
	/** Number of files in config */
	private _numberOfFilesInConfig: number = 0;
	/** Number of files still pending */
	private _filesPending: number = 0;

	constructor(
		errorReporter?: ICoreErrorReporter,
		setupFlags: number = CoreSetup.FRAME_UPDATE_SIMPLE,
		args?: Map<string, unknown>
	)
	{
		super();

		this._errorReporter = errorReporter ?? new DefaultErrorReporter();
		this._setupFlags = setupFlags;
		this._arguments = args ?? new Map();

		// Initialize priority-level receiver arrays
		for (let i = 0; i < NUM_UPDATE_RECEIVER_LEVELS; i++)
		{
			this._updateReceiversByPriority.push([]);
			this._frameSkipCounters.push(0);
		}

		this._lastUpdateTimeMs = performance.now();

		// Select frame update handler based on setup flags
		const mode = setupFlags & CoreSetup.FRAME_UPDATE_MASK;

		switch (mode)
		{
			case CoreSetup.FRAME_UPDATE_SIMPLE:
				log.debug('Core: using simple frame update handler');
				this._frameUpdateHandler = this.simpleFrameUpdateHandler.bind(this);
				break;
			case CoreSetup.FRAME_UPDATE_COMPLEX:
				log.debug('Core: using complex frame update handler');
				this._frameUpdateHandler = this.complexFrameUpdateHandler.bind(this);
				break;
			case CoreSetup.FRAME_UPDATE_EXPERIMENT:
				log.debug('Core: using experimental frame update handler');
				this._frameUpdateHandler = this.experimentalFrameUpdateHandler.bind(this);
				break;
			case CoreSetup.DEBUG:
				log.debug('Core: using debug frame update handler');
				this._frameUpdateHandler = this.debugFrameUpdateHandler.bind(this);
				break;
			default:
				log.debug('Core: using simple frame update handler (default)');
				this._frameUpdateHandler = this.simpleFrameUpdateHandler.bind(this);
		}
	}

	/** Core arguments */
	private _arguments: Map<string, unknown> = new Map();

	get arguments(): Map<string, unknown>
	{
		return this._arguments;
	}

	/** Target FPS for frame budget calculation */
	private _targetFps: number = 60;

	get targetFps(): number
	{
		return this._targetFps;
	}

	// ─── ICore implementation ──────────────────────────────────────────

	/**
	 * Set the target FPS for frame budget calculations.
	 */
	set targetFps(fps: number)
	{
		this._targetFps = fps;
	}

	set errorLogger(logger: ICoreErrorLogger | null)
	{
		if (this._errorReporter)
		{
			this._errorReporter.errorLogger = logger;
		}
	}

	private get hibernating(): boolean
	{
		return this._hibernationLevel > -1;
	}

	/**
	 * Max priority to process (limited during hibernation).
	 */
	private get maxPriority(): number
	{
		return this.hibernating ? this._hibernationLevel + 1 : NUM_UPDATE_RECEIVER_LEVELS;
	}

	/**
	 * Initialize the core. Waits for all locked components, then starts.
	 *
	 * @see CoreComponentContext.as lines 179-208
	 */
	initialize(): void
	{
		if (this.hasLockedComponents())
		{
			const handler = () =>
			{
				if (!this.hasLockedComponents())
				{
					this.events.off(ComponentEvents.UNLOCKED, handler);
					this.doInitialize();
				}
			};
			this.events.on(ComponentEvents.UNLOCKED, handler);
		}
		else
		{
			this.doInitialize();
		}
	}

	clearArguments(): void
	{
		this._arguments = new Map();
	}

	getNumberOfFilesPending(): number
	{
		return this._filesPending;
	}

	getNumberOfFilesLoaded(): number
	{
		return this._numberOfFilesInConfig - this._filesPending;
	}

	/**
	 * Enter hibernation mode.
	 *
	 * During hibernation, only update receivers up to the given priority level
	 * are updated, and at a reduced frequency.
	 *
	 * @param priority - Max priority level to update (0-2)
	 * @param updateFrequency - Updates per second (default 1)
	 *
	 * @see CoreComponentContext.as lines 443-449
	 */
	hibernate(priority: number, updateFrequency: number = 1): void
	{
		if (!this.hibernating)
		{
			this._hibernationLevel = priority;
			this._hibernationUpdateFrequency = 1000 / updateFrequency;
			log.debug(`Core: entering hibernation (priority=${priority}, freq=${updateFrequency}fps)`);
		}
	}

	/**
	 * Resume from hibernation.
	 *
	 * @see CoreComponentContext.as lines 451-456
	 */
	resume(): void
	{
		if (this.hibernating)
		{
			this._hibernationLevel = -1;
			log.debug('Core: resuming from hibernation');
		}
	}

	// ─── ICoreConfiguration proxy (delegates to configuration) ─────────

	setProfilerMode(_enabled: boolean): void
	{
		// Profiler mode is not applicable in the web version.
		// The browser DevTools serve this purpose.
		log.debug('Core: profiler mode not supported in web version, use browser DevTools');
	}

	/**
	 * Trigger a reboot on the next frame.
	 *
	 * @see CoreComponentContext.as lines 707-709
	 */
	reboot(): void
	{
		this._rebootOnNextFrame = true;
	}

	propertyExists(key: string): boolean
	{
		return this.configuration?.propertyExists(key) ?? false;
	}

	getProperty(key: string, params?: Record<string, string>): string
	{
		return this.configuration?.getProperty(key, params) ?? '';
	}

	setProperty(key: string, value: string, persistent?: boolean, log?: boolean): void
	{
		this.configuration?.setProperty(key, value, persistent, log);
	}

	getBoolean(key: string): boolean
	{
		return this.configuration?.getBoolean(key) ?? false;
	}

	getInteger(key: string, defaultValue: number): number
	{
		return this.configuration?.getInteger(key, defaultValue) ?? defaultValue;
	}

	// ─── Update receiver management ────────────────────────────────────

	interpolate(value: string): string
	{
		return this.configuration?.interpolate(value) ?? value;
	}

	updateUrlProtocol(url: string): string
	{
		return this.configuration?.updateUrlProtocol(url) ?? url;
	}

	// ─── Update loop ───────────────────────────────────────────────────

	/**
	 * Register an update receiver at the given priority level (0–2).
	 *
	 * Clamps priority to [0, NUM_UPDATE_RECEIVER_LEVELS - 1].
	 * Removes receiver from any existing level first.
	 *
	 * @see CoreComponentContext.as lines 406-415
	 */
	override registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void
	{
		// Remove from any existing level first
		this.removeUpdateReceiver(receiver);

		// Clamp priority
		priority = Math.min(priority, NUM_UPDATE_RECEIVER_LEVELS - 1);

		this._updateReceiversByPriority[priority].push(receiver);
	}

	// ─── Error handling ────────────────────────────────────────────────

	/**
	 * Remove an update receiver from all priority levels.
	 *
	 * @see CoreComponentContext.as lines 417-441
	 */
	override removeUpdateReceiver(receiver: IUpdateReceiver): void
	{
		if (this.disposed) return;

		for (let level = 0; level < NUM_UPDATE_RECEIVER_LEVELS; level++)
		{
			const receivers = this._updateReceiversByPriority[level];
			const index = receivers.indexOf(receiver);

			if (index > -1)
			{
				receivers[index] = null;
				return;
			}
		}
	}

	// ─── Dispose ───────────────────────────────────────────────────────

	/**
	 * Main update method. Called each frame by the PixiJS ticker (via HeliumCore).
	 *
	 * Handles reboot, hibernation throttling, and delegates to the
	 * active frame update handler.
	 *
	 * @see CoreComponentContext.as lines 466-479 (onEnterFrame)
	 */
	override update(deltaTime: number): void
	{
		if (this.disposed) return;

		// Handle reboot
		if (this._rebootOnNextFrame)
		{
			this._rebootOnNextFrame = false;
			this.events.emit(CoreComponentContextEvents.REBOOT);
			return;
		}

		const now = performance.now();
		const elapsed = now - this._lastUpdateTimeMs;

		// Hibernation throttling
		if (this.hibernating && elapsed < this._hibernationUpdateFrequency)
		{
			return;
		}

		this._frameUpdateHandler(now, elapsed);
		this._lastUpdateTimeMs = now;
	}

	// ─── Private helpers ───────────────────────────────────────────────

	/**
	 * Report an error. Delegates to the error reporter.
	 * Critical errors (except code 2015) trigger disposal.
	 *
	 * @see CoreComponentContext.as lines 247-255
	 */
	override error(message: string, fatal: boolean = false, code: number = -1, error?: Error): void
	{
		super.error(message, fatal, code, error);

		this._errorReporter.logError(message, fatal, code, error);

		if (fatal && code !== 2015)
		{
			this.dispose();
		}
	}

	/**
	 * Dispose the core context and all update receivers.
	 *
	 * @see CoreComponentContext.as lines 210-245
	 */
	override dispose(): void
	{
		if (this.disposed) return;

		log.debug('Disposing core');

		try
		{
			for (let level = 0; level < NUM_UPDATE_RECEIVER_LEVELS; level++)
			{
				const receivers = this._updateReceiversByPriority[level];
				receivers.length = 0;
			}
		}
		catch (e)
		{
			log.error('Error disposing update receivers:', e);
		}

		this._updateReceiversByPriority = [];
		this._frameSkipCounters = [];

		super.dispose();
	}

	/**
	 * Check if any attached components are still locked.
	 */
	private hasLockedComponents(): boolean
	{
		for (const component of this.getAttachedComponents())
		{
			if (component.locked)
			{
				return true;
			}
		}

		return false;
	}

	/**
	 * Complete initialization after all components are unlocked.
	 */
	private doInitialize(): void
	{
		this.events.emit(CoreComponentContextEvents.RUNNING);
		log.info('Core is now running');
	}

	// ─── Frame update handlers ─────────────────────────────────────────

	/**
	 * Simple frame update handler.
	 *
	 * Iterates through all receivers at each priority level, every frame.
	 * Removes null/disposed receivers during iteration.
	 *
	 * @see CoreComponentContext.as lines 481-516
	 */
	private simpleFrameUpdateHandler(_timeMs: number, deltaMs: number): void
	{
		for (let level = 0; level < this.maxPriority; level++)
		{
			this._frameSkipCounters[level] = 0;

			const receivers = this._updateReceiversByPriority[level];
			let i = 0;
			let len = receivers.length;

			while (i < len)
			{
				const receiver = receivers[i];

				if (receiver === null || receiver.disposed)
				{
					receivers.splice(i, 1);
					len--;
				}
				else
				{
					try
					{
						receiver.update(deltaMs);
					}
					catch (e)
					{
						log.error(`Error in update receiver: ${e}`);
						this.error(
							`Error in update receiver: ${(e as Error).message}`,
							true,
							(e as Error).name === 'TypeError' ? -1 : -1,
							e as Error
						);
						return;
					}
					i++;
				}
			}
		}
	}

	/**
	 * Complex frame update handler.
	 *
	 * Time-sliced: if execution exceeds the frame budget, lower-priority
	 * receivers are skipped (up to `level` times).
	 *
	 * @see CoreComponentContext.as lines 518-561
	 */
	private complexFrameUpdateHandler(timeMs: number, deltaMs: number): void
	{
		const frameBudget = 1000 / this._targetFps;
		let ok = true;

		for (let level = 0; level < this.maxPriority; level++)
		{
			const elapsed = performance.now() - timeMs;
			let skip = false;

			if (elapsed > frameBudget)
			{
				if (this._frameSkipCounters[level] < level)
				{
					this._frameSkipCounters[level]++;
					skip = true;
				}
			}

			if (!skip)
			{
				this._frameSkipCounters[level] = 0;

				const receivers = this._updateReceiversByPriority[level];
				let i = 0;
				let len = receivers.length;

				while (i < len && ok)
				{
					const receiver = receivers[i];

					if (receiver === null || receiver.disposed)
					{
						receivers.splice(i, 1);
						len--;
					}
					else
					{
						try
						{
							receiver.update(deltaMs);
						}
						catch (e)
						{
							log.error(`Error in update receiver: ${e}`);
							this.error(
								`Error in update receiver: ${(e as Error).message}`,
								true,
								-1,
								e as Error
							);
							ok = false;
						}
						i++;
					}
				}
			}
		}
	}

	/**
	 * Experimental frame update handler.
	 *
	 * Only cleans up disposed receivers. Actual updates are handled
	 * independently by each receiver's own scheduling.
	 *
	 * @see CoreComponentContext.as lines 601-617
	 */
	private experimentalFrameUpdateHandler(_timeMs: number, _deltaMs: number): void
	{
		for (let level = 0; level < NUM_UPDATE_RECEIVER_LEVELS; level++)
		{
			const receivers = this._updateReceiversByPriority[level];

			for (let i = receivers.length - 1; i >= 0; i--)
			{
				const receiver = receivers[i];

				if (receiver === null || receiver.disposed)
				{
					receivers.splice(i, 1);
				}
			}
		}
	}

	/**
	 * Debug frame update handler.
	 *
	 * Like simple, but without try/catch — errors propagate directly
	 * for easier debugging.
	 *
	 * @see CoreComponentContext.as lines 619-643
	 */
	private debugFrameUpdateHandler(_timeMs: number, deltaMs: number): void
	{
		for (let level = 0; level < this.maxPriority; level++)
		{
			this._frameSkipCounters[level] = 0;

			const receivers = this._updateReceiversByPriority[level];
			let i = 0;
			let len = receivers.length;

			while (i < len)
			{
				const receiver = receivers[i];

				if (receiver === null || receiver.disposed)
				{
					receivers.splice(i, 1);
					len--;
				}
				else
				{
					// No try/catch — errors propagate for debugging
					receiver.update(deltaMs);
					i++;
				}
			}
		}
	}
}

/**
 * Core component context event constants.
 */
export const CoreComponentContextEvents =
	{
		/** Emitted when all components are unlocked and core is running */
		RUNNING: 'COMPONENT_EVENT_RUNNING',

		/** Emitted when core is about to reboot */
		REBOOT: 'COMPONENT_EVENT_REBOOT',
	} as const;
