import {EventEmitter} from 'eventemitter3';
import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import type {IHabboNewNavigator} from './IHabboNewNavigator';
import type {IHabboNavigator} from './IHabboNavigator';
import type {IHabboToolbar} from '../toolbar/IHabboToolbar';
import {HabboToolbarEvent} from '../toolbar/events/HabboToolbarEvent';
import {HabboToolbarIconEnum} from '../toolbar/HabboToolbarIconEnum';
import type {IRoomSessionManager} from '../session/IRoomSessionManager';
import type {IHabboWindowManager} from '../window/IHabboWindowManager';
import {NavigatorData} from './domain';
import {NavigatorCache} from './cache';
import {ContextContainer, SearchContext, SearchContextHistoryManager} from './context';
import {NavigatorView} from './view/NavigatorView';
import {NewIncomingMessages} from './NewIncomingMessages';
import type {
	NavigatorLiftedRoomData,
	NavigatorSavedSearch,
	NavigatorSearchResultSet,
	NavigatorTopLevelContext
} from '../communication/messages/incoming/newnavigator';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
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
import type {IMessageComposer} from "@core";
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {IID_HabboNavigator} from "@iid/IIDHabboNavigator";

const log = Logger.getLogger('NewNavigator');

/**
 * New Habbo Navigator component
 *
 * This is the main navigator part that uses HabboNavigator (legacy)
 * for shared data and functionality through delegation.
 *
 */
export class HabboNewNavigator extends Component implements IHabboNewNavigator
{
	private _incomingMessages: NewIncomingMessages | null = null;
	private _isInitialized: boolean = false;
	private _noPushToHistoryDueToNavigation: boolean = false;
	private _lastSearchCode: string = ViewModeCode.OFFICIAL_VIEW;
	private _lastFiltering: string = '';
	private _roomSessionManager: IRoomSessionManager | null = null;
	private _toolbar: IHabboToolbar | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _view: NavigatorView | null = null;

	constructor(context: IContext)
	{
		super(context);

		this._contextContainer = new ContextContainer();
		this._historyManager = new SearchContextHistoryManager();
		this._cache = new NavigatorCache();
	}

	/**
	 * The window manager.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as get windowManager()
	 */
	get windowManager(): IHabboWindowManager | null
	{
		return this._windowManager;
	}

	/**
	 * The navigator view.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as get view()
	 */
	get view(): NavigatorView | null
	{
		return this._view;
	}

	private _navigatorEvents: EventEmitter = new EventEmitter();

	/**
	 * Custom navigator event emitter (NOT the Component events)
	 *
	 * Uses a separate EventEmitter to avoid overriding Component.events
	 * which would break the dependency injection unlock mechanism.
	 */
	get navigatorEvents(): EventEmitter
	{
		return this._navigatorEvents;
	}

	private _communication: IHabboCommunicationManager | null = null;

	/**
	 * Get the communication manager
	 */
	get communication(): IHabboCommunicationManager
	{
		if (!this._communication)
		{
			throw new Error('[HabboNewNavigator] Communication not available');
		}
		return this._communication;
	}

	private _legacyNavigator: IHabboNavigator | null = null;

	get legacyNavigator(): IHabboNavigator
	{
		return this._legacyNavigator!;
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
		return this._legacyNavigator!.data;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communication = manager;
				},
				true
			),
			new ComponentDependency(
				IID_HabboNavigator,
				(nav: IHabboNavigator | null) =>
				{
					this._legacyNavigator = nav;
				},
				true
			),
			new ComponentDependency(
				IID_RoomSessionManager,
				(manager: IRoomSessionManager | null) =>
				{
					this._roomSessionManager = manager;
				},
				true
			),
			new ComponentDependency(
				IID_HabboToolbar,
				(toolbar: IHabboToolbar | null) =>
				{
					this._toolbar = toolbar;
				},
				false,
				[{
					type: HabboToolbarEvent.TOOLBAR_CLICK,
					callback: ((...args: unknown[]) => this.onHabboToolbarEvent(args[0] as HabboToolbarEvent))
				}]
			),
			new ComponentDependency(
				IID_HabboWindowManager,
				(manager: IHabboWindowManager | null) =>
				{
					this._windowManager = manager;
				}
			),
		];
	}

	/**
	 * Initialize the navigator (send init message to server).
	 * Called from outside if needed before initComponent runs.
	 */
	init(): void
	{
		if(this._isInitialized) return;

		this._isInitialized = true;

		this.send(new NewNavigatorInitComposer());

		log.info('New Navigator init message sent');
	}

	initialize(topLevelContexts: NavigatorTopLevelContext[]): void
	{
		this._contextContainer.initialize(topLevelContexts);
		this.data.topLevelContexts = topLevelContexts;

		this._isReady = true;

		this._navigatorEvents.emit('navigator:initialized');

		log.info(`Navigator initialized with ${topLevelContexts.length} contexts`);
	}

	/**
	 * Handle search results from the server.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as onSearchResult()
	 */
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

		// Update the view if visible (like AS3)
		if(this._view && this._view.visible)
		{
			this._view.onSearchResults(results);
		}

		this._navigatorEvents.emit('navigator:searchResults', results);

		log.debug(`Search results: ${results.blocks.length} blocks`);
	}

	onLiftedRooms(rooms: NavigatorLiftedRoomData[]): void
	{
		log.debug(`Lifted rooms: ${rooms.length}`);
	}

	/**
	 * Handle saved searches from the server.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as onSavedSearches()
	 */
	onSavedSearches(searches: NavigatorSavedSearch[]): void
	{
		this._contextContainer.savedSearches = searches;

		if(this._view)
		{
			this._view.onSavedSearches(searches);
		}

		this._navigatorEvents.emit('navigator:savedSearches', searches);

		log.debug(`Saved searches: ${searches.length}`);
	}

	onCollapsedCategories(categories: string[]): void
	{
		this._collapsedCategories = categories;

		this._navigatorEvents.emit('navigator:collapsed', categories);

		log.debug(`Collapsed categories: ${categories.length}`);
	}

	/**
	 * Open the navigator.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as open()
	 */
	open(): void
	{
		if(this._view === null) return;

		if(!this._view.visible)
		{
			this._view.visible = true;
		}
	}

	/**
	 * Close the navigator.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as close()
	 */
	close(): void
	{
		if(this._view === null) return;

		if(this._view.visible)
		{
			this._view.visible = false;
		}
	}

	/**
	 * Toggle the navigator.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as toggle()
	 */
	toggle(): void
	{
		if(this._view === null) return;

		this._view.visible = !this._view.visible;

		if(this._view.visible)
		{
			this.performLastSearch();
		}
	}

	/**
	 * Perform a search.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as performSearch()
	 */
	performSearch(searchCode: string, filtering: string = '', _source: string = ''): void
	{
		if(this._view)
		{
			this._view.isBusy = true;
		}

		this._lastSearchCode = searchCode;
		this._lastFiltering = filtering;

		// Check cache first
		const cached = this._cache.getEntry(`${searchCode}/${filtering}`);

		if(cached)
		{
			this.onSearchResult(cached);

			return;
		}

		this.send(new NewNavigatorSearchComposer(searchCode, filtering));

		this.open();

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

	goToRoom(roomId: number, _source: string = 'mainview', password: string = ''): void
	{
		if (!this._roomSessionManager)
		{
			log.error('RoomSessionManager not available');
			return;
		}

		// Use RoomSessionManager to enter the room
		// This will send OpenFlatConnectionMessageComposer via RoomSession.start()
		this._roomSessionManager.gotoRoom(roomId, password);

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

	addSavedSearch(searchCode: string, filtering: string): void
	{
		this.send(new NavigatorAddSavedSearchComposer(searchCode, filtering));
	}

	deleteSavedSearch(id: number): void
	{
		this.send(new NavigatorDeleteSavedSearchComposer(id));
	}

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

	setSearchCodeViewMode(searchCode: string, viewMode: number): void
	{
		this.send(new NavigatorSetSearchCodeViewModeMessageComposer(searchCode, viewMode));
	}

	override dispose(): void
	{
		if (this.disposed) return;

		this._view?.dispose();
		this._view = null;
		this._incomingMessages?.dispose();
		this._navigatorEvents.removeAllListeners();
		this._toolbar = null;
		this._windowManager = null;

		log.info('New Navigator disposed');

		super.dispose();
	}

	/**
	 * Initialize the navigator component.
	 *
	 * Creates incoming message handlers and the navigator view,
	 * then sends the init message to the server.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as initComponent()
	 */
	protected override initComponent(): void
	{
		this._incomingMessages = new NewIncomingMessages(this);
		this._view = new NavigatorView(this);

		this.send(new NewNavigatorInitComposer());
		this._isInitialized = true;

		log.info('New Navigator initialized');
	}

	/**
	 * Handle toolbar click events.
	 *
	 * Toggles the navigator when the NAVIGATOR icon is clicked.
	 *
	 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as onHabboToolbarEvent()
	 */
	private onHabboToolbarEvent(event: HabboToolbarEvent): void
	{
		if(event.type === HabboToolbarEvent.TOOLBAR_CLICK)
		{
			if(event.iconId === HabboToolbarIconEnum.NAVIGATOR)
			{
				this.toggle();
			}
		}
	}

	private send(composer: IMessageComposer<unknown[]>): void
	{
		const connection = this._communication?.connection;

		if (connection)
		{
			connection.send(composer);
		}
	}
}
