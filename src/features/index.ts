/**
 * Helium Feature Modules
 *
 * Self-contained modules combining reactive state, actions, and message handlers.
 *
 * @example
 * ```typescript
 * import { navigator, inventory, session } from '@/features';
 *
 * // Read reactive state
 * const isOpen = navigator.isOpen();
 *
 * // Call actions
 * navigator.open();
 * navigator.search('hotel_view');
 *
 * // Initialize at app startup
 * navigator.init({ navigator: habboNav, newNavigator: habboNewNav });
 * ```
 *
 * @module features
 */

// ============================================================================
// Feature Exports
// ============================================================================

// Connection - WebSocket state and authentication
export {connection} from './connection';
export type {Connection, ConnectionState, LoadingStep} from './connection';

// Session - User profile, permissions, currencies
export {session} from './session';
export type {Session, UserData, AvailabilityStatus} from './session';

// Config - External variables configuration
export {config} from './config';
export type {Config, ConfigManagers} from './config';

// Localization - Translated strings
export {localization} from './localization';
export type {Localization, LocalizationManagers} from './localization';

// Navigator - Room navigation and search
export {navigator} from './navigator';
export type {Navigator, NavigatorManagers} from './navigator';

// Inventory - Furniture, badges, effects, pets, bots
export {inventory} from './inventory';
export type {Inventory, InventoryManagers} from './inventory';

// Room - Current room state
export {room} from './room';
export type {Room} from './room';

// Favourites - Favourite rooms list
export {favourites} from './favourites';
export type {Favourites} from './favourites';

// ============================================================================
// Lifecycle Functions
// ============================================================================

// Import for internal use (avoiding naming conflicts)
import {connection} from './connection';
import {session} from './session';
import {config} from './config';
import {localization} from './localization';
import {navigator as navigatorFeature} from './navigator';
import {inventory} from './inventory';
import {room} from './room';
import {favourites} from './favourites';

/**
 * Initialize features that only need message event listeners.
 * Call this after managers are ready.
 */
export function initFeatures(): void
{
	session.init();
	room.init();
	favourites.init();
}

/**
 * Dispose all features and reset state.
 * Call this on disconnect.
 */
export function disposeFeatures(): void
{
	connection.reset();
	session.dispose();
	session.reset();
	config.dispose();
	localization.dispose();
	navigatorFeature.dispose();
	inventory.dispose();
	room.dispose();
	room.clear();
	favourites.dispose();
}
