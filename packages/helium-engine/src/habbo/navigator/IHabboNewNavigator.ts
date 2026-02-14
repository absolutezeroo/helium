import type {EventEmitter} from 'eventemitter3';
import type {IHabboNavigator} from './IHabboNavigator';
import type {NavigatorData} from './domain';
import type {ContextContainer, SearchContextHistoryManager} from './context';
import type {NavigatorCache} from './cache';
import type {NavigatorSearchResultSet} from '../communication/messages/incoming/newnavigator';
import {IDisposable} from "@core";

/**
 * New Navigator interface
 *
 */
export interface IHabboNewNavigator extends IDisposable
{
	/**
	 * Custom navigator event emitter (NOT the Component events)
	 */
	readonly navigatorEvents: EventEmitter;

	/**
	 * Check if navigator is ready
	 */
	readonly isReady: boolean;

	/**
	 * Get the legacy navigator
	 */
	readonly legacyNavigator: IHabboNavigator;

	/**
	 * Get the navigator data model (from legacy navigator)
	 */
	readonly data: NavigatorData;

	/**
	 * Get the context container
	 */
	readonly contextContainer: ContextContainer;

	/**
	 * Get the search history manager
	 */
	readonly historyManager: SearchContextHistoryManager;

	/**
	 * Get the navigator cache
	 */
	readonly cache: NavigatorCache;

	/**
	 * Get current search results
	 */
	readonly currentResults: NavigatorSearchResultSet | null;

	/**
	 * Get collapsed categories
	 */
	readonly collapsedCategories: string[];

	/**
	 * Initialize the navigator (send init message to server)
	 * Called automatically on first open, or can be called manually after auth
	 */
	init(): void;

	/**
	 * Open the navigator
	 */
	open(): void;

	/**
	 * Close the navigator
	 */
	close(): void;

	/**
	 * Toggle the navigator
	 */
	toggle(): void;

	/**
	 * Perform a search
	 */
	performSearch(searchCode: string, filtering?: string, source?: string): void;

	/**
	 * Perform the last search again
	 */
	performLastSearch(): void;

	/**
	 * Perform a tag search
	 */
	performTagSearch(tag: string): void;

	/**
	 * Perform a text search
	 */
	performTextSearch(text: string): void;

	/**
	 * Go back in search history
	 */
	goBack(): void;

	/**
	 * Go forward in search history
	 */
	goForward(): void;

	/**
	 * Go to a room
	 */
	goToRoom(roomId: number, source?: string): void;

	/**
	 * Go to home room
	 */
	goToHomeRoom(): void;

	/**
	 * Add a saved search
	 */
	addSavedSearch(searchCode: string, filtering: string): void;

	/**
	 * Delete a saved search
	 */
	deleteSavedSearch(id: number): void;

	/**
	 * Add a collapsed category
	 */
	addCollapsedCategory(category: string): void;

	/**
	 * Remove a collapsed category
	 */
	removeCollapsedCategory(category: string): void;

	/**
	 * Check if a category is collapsed
	 */
	isCategoryCollapsed(category: string): boolean;

	/**
	 * Set view mode for a search code
	 */
	setSearchCodeViewMode(searchCode: string, viewMode: number): void;
}
