import {Logger} from '@core/utils/Logger';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboNewNavigator} from '../HabboNewNavigator';
import type {NavigatorSearchResultSet} from '../../communication/messages/incoming/newnavigator';

const log = Logger.getLogger('NavigatorView');

const LAYOUT_NAME = 'navigator_frame_2';

/**
 * Navigator view — manages the navigator window via the window manager.
 *
 * Builds the navigator window tree from the registered layout asset
 * using `windowManager.buildWidgetLayout()` (equivalent to AS3's
 * `windowManager.buildFromXML()`). The resulting IWindow tree is
 * rendered by the WindowRenderer just like BottomBarLeft.
 *
 * @see source_as_win63/habbo/navigator/view/NavigatorView.as
 */
export class NavigatorView
{
	private _navigator: HabboNewNavigator;
	private _window: IWindowContainer | null = null;

	constructor(navigator: HabboNewNavigator)
	{
		this._navigator = navigator;
	}

	private _isBusy: boolean = false;

	get isBusy(): boolean
	{
		return this._isBusy;
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

	/**
	 * Whether the navigator window is visible.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as get visible()
	 */
	get visible(): boolean
	{
		if(this._window)
		{
			return this._window.visible;
		}

		return false;
	}

	/**
	 * Show or hide the navigator window.
	 *
	 * On first show, creates the window via buildWidgetLayout().
	 * Mirrors AS3's `set visible()` which called `createMainWindow()` lazily.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as set visible()
	 */
	set visible(value: boolean)
	{
		const windowManager = this._navigator.windowManager;

		if(!windowManager)
		{
			log.warn('WindowManager not available');

			return;
		}

		log.debug(`set visible(${value}), isReady=${this._navigator.isReady}, hasWindow=${this._window !== null}`);

		if(value)
		{
			if(this._window === null)
			{
				this.createMainWindow();
			}

			if(this._window)
			{
				if(this._navigator.currentResults !== null)
				{
					this.onSearchResults(this._navigator.currentResults);
				}
				else if(!this._isBusy)
				{
					this._navigator.performSearch('official_view');
				}
			}
		}

		if(this._window)
		{
			this._window.visible = value;
		}
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
	 * Dispose the view and clean up.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as dispose()
	 */
	dispose(): void
	{
		if(this._window)
		{
			this._window.dispose();
			this._window = null;
		}
	}

	/**
	 * Create the main navigator window via the window manager.
	 *
	 * Uses `buildWidgetLayout()` to create a real IWindow tree
	 * (equivalent to AS3's `buildFromXML(assets.getAssetByName("navigator_frame_2_xml").content)`).
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as createMainWindow()
	 */
	private createMainWindow(): void
	{
		const windowManager = this._navigator.windowManager;

		if(!windowManager) return;

		log.debug(`Building layout: ${LAYOUT_NAME}`);

		const built = windowManager.buildWidgetLayout(LAYOUT_NAME);

		if(!built)
		{
			log.warn(`Layout not found: ${LAYOUT_NAME}`);

			return;
		}

		this._window = built as IWindowContainer;

		log.info(`Navigator window created: ${this._window.width}x${this._window.height} at (${this._window.x}, ${this._window.y})`);

		// Wire up close button procedure
		const closeButton = this._window.findChildByName?.('header_button_close');

		if(closeButton)
		{
			closeButton.addEventListener(WindowMouseEvent.CLICK, this.onCloseClick);
		}

		// Wire up refresh button procedure
		const refreshButton = this._window.findChildByName?.('refreshButton');

		if(refreshButton)
		{
			refreshButton.addEventListener(WindowMouseEvent.CLICK, this.onRefreshClick);
		}
	}

	/**
	 * Handle close button click.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as headerProcedure()
	 */
	private onCloseClick = (_event: WindowEvent): void =>
	{
		this.visible = false;
		this._navigator.close();
	};

	/**
	 * Handle refresh button click.
	 *
	 * @see source_as_win63/habbo/navigator/view/NavigatorView.as refreshSearchResults()
	 */
	private onRefreshClick = (_event: WindowEvent): void =>
	{
		this._navigator.performLastSearch();
	};
}
