import {getHelium} from '@ui/api/helium/getHelium';
import {connectionStore} from './connectionStore';
import {sessionStore} from './sessionStore';
import {favouritesStore} from './favouritesStore';
import {roomStore} from './roomStore';
import {configStore} from './configStore';
import {localizationStore} from './localizationStore';
import {navigatorStore} from './navigatorStore';
import {inventoryStore} from './inventoryStore';
import {landingViewStore} from './landingViewStore';

/**
 * Initialize all stores and wire them to the engine.
 *
 * Called once after engine bootstrap.
 * Each store's init() registers its message event listeners via getCommunication().
 *
 * @see source_nitro_react - equivalent pattern where components self-register via hooks
 */
export function initStores(): void
{
	// Stores without manager dependencies
	sessionStore.init();
	favouritesStore.init();
	roomStore.init();

	// Wire connection state tracking
	getHelium().habboCommunication.setConnectionActions(connectionStore.actions);

	// Stores with manager dependencies
	configStore.init();
	localizationStore.init();
	navigatorStore.init();
	inventoryStore.init();
	landingViewStore.init();
}

// Re-exports
export {connectionStore} from './connectionStore';
export type {ConnectionActions} from './connectionStore';
export {sessionStore} from './sessionStore';
export {favouritesStore} from './favouritesStore';
export {roomStore, RoomUserType} from './roomStore';
export type {RoomUserData, RoomSessionState} from './roomStore';
export {configStore} from './configStore';
export {localizationStore} from './localizationStore';
export {navigatorStore, DoorStateType} from './navigatorStore';
export type {DoorData} from './navigatorStore';
export {inventoryStore} from './inventoryStore';
export {landingViewStore} from './landingViewStore';
