import type {IContext} from './IContext';
import type {ICoreConfiguration} from './ICoreConfiguration';
import type {ICoreErrorLogger} from './ICoreErrorLogger';

/**
 * Core Interface
 *
 * The top-level core runtime interface. Extends IContext (component management,
 * update loop, events) and ICoreConfiguration (property access).
 *
 * Provides initialization, hibernation, purge, reboot, and profiler mode.
 *
 * @see sources/win63_version/core/runtime/ICore.as
 */
export interface ICore extends IContext, ICoreConfiguration
{
	/**
	 * Initialize the core. Waits for all locked components to unlock,
	 * then dispatches COMPONENT_EVENT_RUNNING.
	 */
	initialize(): void;

	/**
	 * Purge cached data across all components.
	 */
	purge(): void;

	/**
	 * Enter hibernation mode. Updates at a reduced frequency.
	 *
	 * @param priority - Maximum priority level to still update (0-2)
	 * @param updateFrequency - Updates per second during hibernation (default 1)
	 */
	hibernate(priority: number, updateFrequency?: number): void;

	/**
	 * Resume from hibernation.
	 */
	resume(): void;

	/**
	 * Get the number of libraries still loading.
	 */
	getNumberOfFilesPending(): number;

	/**
	 * Get the number of libraries that have loaded.
	 */
	getNumberOfFilesLoaded(): number;

	/**
	 * Enable or disable profiler mode.
	 */
	setProfilerMode(enabled: boolean): void;

	/**
	 * Core arguments dictionary.
	 */
	readonly arguments: Map<string, unknown>;

	/**
	 * Clear core arguments.
	 */
	clearArguments(): void;

	/**
	 * Set the external error logger.
	 */
	set errorLogger(logger: ICoreErrorLogger | null);

	/**
	 * Trigger a core reboot on the next frame.
	 */
	reboot(): void;
}
