import {Logger} from '@core/utils/Logger';
import {WindowManagerEvents} from '../../window/IHabboWindowManager';
import type {IWindowInstance} from '../../window/IWindowInstance';
import type {IWindowLayout} from '../../window/IWindowLayout';
import type {HabboNewNavigator} from '../HabboNewNavigator';
import type {NavigatorSearchResultSet} from '../../communication/messages/incoming/newnavigator';

const log = Logger.getLogger('NavigatorView');

const LAYOUT_NAME = 'navigator_frame_2';

/**
 * Navigator view — manages the navigator window via the window manager.
 *
 * This mirrors the AS3 NavigatorView which used `windowManager.buildFromXML()`
 * to create the navigator window and handled all element interactions.
 *
 * In our architecture, the window manager creates instances and the client's
 * WindowLayerManager + WindowLayoutRenderer handles the actual rendering.
 * This class controls the lifecycle: create, show, hide, close.
 *
 * @see source_as_win63/habbo/navigator/view/NavigatorView.as
 */
export class NavigatorView
{
	private _navigator: HabboNewNavigator;
	private _window: IWindowInstance | null = null;
	private _visible: boolean = false;
	private _isBusy: boolean = false;

	constructor(navigator: HabboNewNavigator)
	{
		this._navigator = navigator;

		// Listen for window close events (close button clicked by user)
		const windowManager = this._navigator.windowManager;

		if(windowManager)
		{
			windowManager.windowEvents.on(WindowManagerEvents.WINDOW_CLOSE, this.onWindowClose.bind(this));
			windowManager.windowEvents.on(WindowManagerEvents.WINDOW_ELEMENT_CLICK, this.onElementClick.bind(this));
		}
	}

	/**
	 * Show or hide the navigator window.
	 *
	 * On first show, creates the window via windowManager.openWindow().
	 * Mirrors AS3's `set visible()` which called `createMainWindow()` lazily.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as set visible()
	 */
	set visible(value: boolean)
	{
		const windowManager = this._navigator.windowManager;

		if(!windowManager) return;

		if(value && this._navigator.isReady)
		{
			if(this._window === null)
			{
				this.createMainWindow();
			}

			if(this._navigator.currentResults !== null)
			{
				this.onSearchResults(this._navigator.currentResults);
			}
			else if(!this._isBusy)
			{
				this._navigator.performSearch('official_view');
			}
		}

		if(this._window !== null)
		{
			if(value && !this._visible)
			{
				// Window already exists but was hidden — re-open it
				if(!windowManager.getWindow(this._window.id))
				{
					this.createMainWindow();
				}
			}
			else if(!value && this._visible)
			{
				// Hide — close the window
				windowManager.closeWindow(this._window.id);
				this._window = null;
			}
		}

		this._visible = value;
	}

	/**
	 * Whether the navigator window is visible.
	 */
	get visible(): boolean
	{
		return this._visible;
	}

	/**
	 * Set busy state (show loading indicator).
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as set isBusy()
	 */
	set isBusy(value: boolean)
	{
		this._isBusy = value;
	}

	get isBusy(): boolean
	{
		return this._isBusy;
	}

	/**
	 * Called when search results arrive.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as onSearchResults()
	 */
	onSearchResults(_results: NavigatorSearchResultSet, _source: string = ''): void
	{
		this._isBusy = false;

		log.debug('Search results received');
	}

	/**
	 * Called when saved searches are updated.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as onSavedSearches()
	 */
	onSavedSearches(_searches: unknown[]): void
	{
		log.debug('Saved searches updated');
	}

	/**
	 * Set initial window dimensions from server preferences.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as setInitialWindowDimensions()
	 */
	setInitialWindowDimensions(_x: number, _y: number, _height: number, _leftPaneHidden: boolean, _resultsMode: number): void
	{
		log.debug('Window preferences set');
	}

	/**
	 * Refresh lifted rooms display.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as refreshLiftedRooms()
	 */
	refreshLiftedRooms(): void
	{
		log.debug('Lifted rooms refreshed');
	}

	/**
	 * Handle group details arrival.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as onGroupDetailsArrived()
	 */
	onGroupDetailsArrived(_groupId: number): void
	{
		log.debug('Group details arrived');
	}

	/**
	 * Create the main navigator window via the window manager.
	 *
	 * Mirrors AS3's `createMainWindow()` which called
	 * `windowManager.buildFromXML(XML(assets.getAssetByName("navigator_frame_2_xml").content))`.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as createMainWindow()
	 */
	private createMainWindow(): void
	{
		const windowManager = this._navigator.windowManager;

		if(!windowManager) return;

		const layout: IWindowLayout | null = windowManager.getLayout(LAYOUT_NAME);

		if(!layout)
		{
			log.warn(`Layout not found: ${LAYOUT_NAME}`);

			return;
		}

		this._window = windowManager.openWindow(layout);

		log.debug(`Navigator window created (id=${this._window.id})`);
	}

	/**
	 * Handle window close events from the window manager.
	 *
	 * When the user clicks the close button, the window system emits WINDOW_CLOSE.
	 * We sync back to the engine navigator.
	 */
	private onWindowClose(instance: IWindowInstance): void
	{
		if(!this._window || instance.id !== this._window.id) return;

		this._window = null;
		this._visible = false;

		this._navigator.close();
	}

	/**
	 * Handle element click events on the navigator window.
	 *
	 * Mirrors AS3's window procedure callbacks:
	 * - header_button_close → close
	 * - refreshButton → performLastSearch
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as headerProcedure()
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as refreshSearchResults()
	 */
	private onElementClick(data: { windowId: number; elementName: string }): void
	{
		if(!this._window || data.windowId !== this._window.id) return;

		switch(data.elementName)
		{
			case 'header_button_close':
				this.visible = false;
				break;

			case 'refreshButton':
				this._navigator.performLastSearch();
				break;

			case 'create_room':
				log.debug('Create room clicked');
				break;

			case 'random_room':
				log.debug('Random room clicked');
				break;
		}
	}

	/**
	 * Dispose the view and clean up.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as dispose()
	 */
	dispose(): void
	{
		const windowManager = this._navigator.windowManager;

		if(windowManager)
		{
			windowManager.windowEvents.off(WindowManagerEvents.WINDOW_CLOSE, this.onWindowClose.bind(this));
			windowManager.windowEvents.off(WindowManagerEvents.WINDOW_ELEMENT_CLICK, this.onElementClick.bind(this));

			if(this._window)
			{
				windowManager.closeWindow(this._window.id);
				this._window = null;
			}
		}

		this._visible = false;
	}
}
