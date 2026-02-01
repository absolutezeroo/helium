import {inject, injectable} from 'inversify';
import type {IHabboNewNavigator} from './IHabboNewNavigator';
import type {IHabboNavigator} from './IHabboNavigator';
import {NavigatorData} from './domain';
import {NavigatorCache} from './cache';
import {ContextContainer, SearchContext, SearchContextHistoryManager} from './context';
import {NewIncomingMessages} from './NewIncomingMessages';
import type {
	NavigatorLiftedRoomData,
	NavigatorSavedSearch,
	NavigatorSearchResultSet,
	NavigatorTopLevelContext
} from '../communication/messages/incoming/newnavigator';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import {TYPES} from '@iid/types';
import {Logger} from '@core/utils/Logger';
import {ViewModeCode} from './view';

// Composers
import {
	NavigatorAddCollapsedCategoryMessageComposer,
	NavigatorAddSavedSearchComposer,
	NavigatorDeleteSavedSearchComposer,
	NavigatorRemoveCollapsedCategoryMessageComposer,
	NavigatorSetSearchCodeViewModeMessageComposer,
	NewNavigatorInitComposer,
	NewNavigatorSearchComposer,
} from '../communication/messages/outgoing/newnavigator';
import {GetGuestRoomMessageComposer,} from '../communication/messages/outgoing/navigator';

const log = Logger.getLogger('NewNavigator');

/**
 * New Habbo Navigator component
 *
 * This is the main navigator component that uses HabboNavigator (legacy)
 * for shared data and functionality through delegation.
 *
 */
@injectable()
export class HabboNewNavigator implements IHabboNewNavigator
{
	private _communication: IHabboCommunicationManager;
	private _incomingMessages: NewIncomingMessages;
	private _isOpen: boolean = false;
	private _isInitialized: boolean = false;
	private _noPushToHistoryDueToNavigation: boolean = false;
	private _lastSearchCode: string = ViewModeCode.OFFICIAL_VIEW;
	private _lastFiltering: string = '';

	constructor(
		@inject(TYPES.HabboCommunicationManager) communication: IHabboCommunicationManager,
		@inject(TYPES.NavigatorManager) legacyNavigator: IHabboNavigator
	)
	{
		this._communication = communication;
		this._legacyNavigator = legacyNavigator;
		this._contextContainer = new ContextContainer();
		this._historyManager = new SearchContextHistoryManager();
		this._cache = new NavigatorCache();

		// Create message handler - uses the legacy navigator's data for shared state
		this._incomingMessages = new NewIncomingMessages(this, communication, this._legacyNavigator.data);

		log.info('New Navigator created');
	}

	private _legacyNavigator: IHabboNavigator;

	get legacyNavigator(): IHabboNavigator
	{
		return this._legacyNavigator;
	}

	private _contextContainer: ContextContainer;

	get contextContainer(): ContextContainer
	{
		return this._contextContainer;
	}

	private _historyManager: SearchContextHistoryManager;

	get historyManager(): SearchContextHistoryManager
	{
		return this._historyManager;
	}

	private _cache: NavigatorCache;

	get cache(): NavigatorCache
	{
		return this._cache;
	}

	// ========== Properties ==========

	private _isReady: boolean = false;

	get isReady(): boolean
	{
		return this._isReady;
	}

	private _currentResults: NavigatorSearchResultSet | null = null;

	get currentResults(): NavigatorSearchResultSet | null
	{
		return this._currentResults;
	}

	private _collapsedCategories: string[] = [];

	get collapsedCategories(): string[]
	{
		return this._collapsedCategories;
	}

	/**
	 * Get the navigator data model
	 * Uses legacy navigator's data for shared state
	 */
	get data(): NavigatorData
	{
		return this._legacyNavigator.data;
	}

	/**
	 * Initialize the navigator (send init message to server)
	 * Should be called after connection is established
	 */
	init(): void
	{
		if (this._isInitialized) return;
		this._isInitialized = true;

		this.send(new NewNavigatorInitComposer());

		log.info('New Navigator init message sent');
	}

	// ========== Initialization ==========

	initialize(topLevelContexts: NavigatorTopLevelContext[]): void
	{
		this._contextContainer.initialize(topLevelContexts);
		this.data.topLevelContexts = topLevelContexts;

		this._isReady = true;

		log.info(`Navigator initialized with ${topLevelContexts.length} contexts`);
	}

	// ========== Search Results ==========

	onSearchResult(results: NavigatorSearchResultSet): void
	{
		this._currentResults = results;
		this.data.navigatorSearchResultSet = results;

		if (!this._noPushToHistoryDueToNavigation)
		{
			this._historyManager.addSearchContextAtCurrentOffset(
				new SearchContext(results.searchCode, results.filteringData)
			);
		}

		this._cache.put(`${results.searchCode}/${results.filteringData}`, results);

		this._noPushToHistoryDueToNavigation = false;

		log.debug(`Search results: ${results.blocks.length} blocks`);
	}

	onLiftedRooms(rooms: NavigatorLiftedRoomData[]): void
	{
		log.debug(`Lifted rooms: ${rooms.length}`);
	}

	onSavedSearches(searches: NavigatorSavedSearch[]): void
	{
		this._contextContainer.savedSearches = searches;

		log.debug(`Saved searches: ${searches.length}`);
	}

	onCollapsedCategories(categories: string[]): void
	{
		this._collapsedCategories = categories;

		log.debug(`Collapsed categories: ${categories.length}`);
	}

	// ========== Navigation ==========

	open(): void
	{
		if (this._isOpen) return;

		// Initialize on first open if not already done
		if (!this._isInitialized)
		{
			this.init();
		}

		this._isOpen = true;

		log.debug('Navigator opened');
	}

	close(): void
	{
		if (!this._isOpen) return;

		this._isOpen = false;

		log.debug('Navigator closed');
	}

	toggle(): void
	{
		if (this._isOpen)
		{
			this.close();
		} else
		{
			this.open();
		}
	}

	// ========== Search ==========

	performSearch(searchCode: string, filtering: string = '', _source: string = ''): void
	{
		this._lastSearchCode = searchCode;
		this._lastFiltering = filtering;

		// Check cache first
		const cached = this._cache.getEntry(`${searchCode}/${filtering}`);

		if (cached)
		{
			this.onSearchResult(cached);
			return;
		}

		this.send(new NewNavigatorSearchComposer(searchCode, filtering));

		log.debug(`Searching: ${searchCode}, filter: ${filtering}`);
	}

	performLastSearch(): void
	{
		if (this._lastSearchCode)
		{
			this._cache.removeEntry(`${this._lastSearchCode}/${this._lastFiltering}`);

			this.performSearch(this._lastSearchCode, this._lastFiltering);
		}
	}

	performTagSearch(tag: string): void
	{
		let searchTag = tag;

		if (searchTag.indexOf(' ') !== -1)
		{
			searchTag = '"' + searchTag + '"';
		}

		this.performSearch(ViewModeCode.HOTEL_VIEW, 'tag:' + searchTag);
	}

	performTextSearch(text: string): void
	{
		this.performSearch(ViewModeCode.HOTEL_VIEW, text);
	}

	goBack(): void
	{
		const context = this._historyManager.getPreviousSearchContextAndGoBack();

		if (context)
		{
			this._noPushToHistoryDueToNavigation = true;

			this.performSearch(context.searchCode, context.filtering);
		}
	}

	goForward(): void
	{
		const context = this._historyManager.getNextSearchContextAndMoveForward();

		if (context)
		{
			this._noPushToHistoryDueToNavigation = true;
			this.performSearch(context.searchCode, context.filtering);
		}
	}

	// ========== Room Navigation ==========

	goToRoom(roomId: number, _source: string = 'mainview'): void
	{
		this.send(new GetGuestRoomMessageComposer(roomId, false, true));

		this.close();

		log.info(`Going to room: ${roomId}`);
	}

	goToHomeRoom(): void
	{
		const homeRoomId = this.data.homeRoomId;

		if (homeRoomId > 0)
		{
			this.goToRoom(homeRoomId, 'external');
		}
	}

	// ========== Saved Searches ==========

	addSavedSearch(searchCode: string, filtering: string): void
	{
		this.send(new NavigatorAddSavedSearchComposer(searchCode, filtering));
	}

	deleteSavedSearch(id: number): void
	{
		this.send(new NavigatorDeleteSavedSearchComposer(id));
	}

	// ========== Category Collapse ==========

	addCollapsedCategory(category: string): void
	{
		this.send(new NavigatorAddCollapsedCategoryMessageComposer(category));

		if (!this._collapsedCategories.includes(category))
		{
			this._collapsedCategories.push(category);
		}
	}

	removeCollapsedCategory(category: string): void
	{
		this.send(new NavigatorRemoveCollapsedCategoryMessageComposer(category));

		const index = this._collapsedCategories.indexOf(category);

		if (index !== -1)
		{
			this._collapsedCategories.splice(index, 1);
		}
	}

	isCategoryCollapsed(category: string): boolean
	{
		return this._collapsedCategories.includes(category);
	}

	// ========== View Mode ==========

	setSearchCodeViewMode(searchCode: string, viewMode: number): void
	{
		this.send(new NavigatorSetSearchCodeViewModeMessageComposer(searchCode, viewMode));
	}

	// ========== Utility ==========

	dispose(): void
	{
		this._incomingMessages.dispose();

		log.info('New Navigator disposed');
	}

	// ========== Dispose ==========

	private send(composer: { getMessageArray(): unknown[]; dispose(): void }): void
	{
		const connection = this._communication.connection;

		if (connection)
		{
			connection.send(composer);
		}
	}
}
