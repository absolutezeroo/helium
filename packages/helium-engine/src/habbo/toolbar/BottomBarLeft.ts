import type {HabboToolbar} from './HabboToolbar';
import type {MeMenuNewController} from './memenu/MeMenuNewController';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import {HabboToolbarIconEnum} from './HabboToolbarIconEnum';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('BottomBarLeft');

/**
 * Horizontal bottom bar with icon click handlers, unseen counters, and collapse
 *
 * Builds a horizontal toolbar from the registered 'bottom_bar_left_xml' layout,
 * manages icon visibility by toolbar state tags, handles collapse/expand, and
 * routes icon clicks to toggleWindowVisibility.
 *
 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as
 */
export class BottomBarLeft
{
	private static readonly DEFAULT_LOCATION = { x: 0, y: 500 };
	private static readonly LANDING_VIEW_LOCATION = { x: 0, y: 500 };
	private static readonly ICON_BG_COLOR_OVER: number = 0xFF716769;
	private static readonly ICON_BG_COLOR_OUT: number = 0xFF57504D;
	private static readonly ICON_MOUSE_OVER: string = '_hover';
	private static readonly ICON_MOUSE_OUT: string = '_normal';
	private static readonly COUNTER_MARGIN: number = 0;
	private static readonly ME_MENU_ICON_NAME: string = 'icon_me_menu';
	private static readonly ICON_REGION_WIDTH: number = 45;
	private static readonly ICON_LABEL_HEIGHT: number = 20;
	private static readonly WINDOW_RIGHT_PADDING: number = 10;
	private static readonly COLLAPSED_MARGIN: number = 185;

	private _disposed: boolean = false;
	private _toolbar: HabboToolbar | null;
	private _windowManager: IHabboWindowManager | null;
	private _window: IWindowContainer | null = null;
	private _buttonContainer: IWindow | null = null;
	private _leftArrow: IWindow | null = null;
	private _rightArrow: IWindow | null = null;
	private _lineSeparator: IWindow | null = null;
	private _newItemsLabel: IWindowContainer | null = null;
	private _unseenItemCounters: Map<string, unknown> = new Map();
	private _newItemsNotificationEnabled: boolean = false;
	private _newItemsLabelVisible: boolean = false;
	private _collapsed: boolean = false;
	private _lastState: string = '';
	private _unseenAchievementCount: number = 0;
	private _unseenMiniMailMessageCount: number = 0;
	private _unseenForumsCount: number = 0;
	private _meMenuController: MeMenuNewController | null = null;

	/**
	 * Constructs the toolbar window from the registered layout and wires up
	 * click handlers on TOGGLE-tagged regions and collapse arrows.
	 *
	 * @param toolbar - The parent HabboToolbar component
	 * @param windowManager - The window manager for building layouts
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as constructor
	 */
	constructor(toolbar: HabboToolbar, windowManager: IHabboWindowManager)
	{
		this._toolbar = toolbar;
		this._windowManager = windowManager;

		// Build the toolbar window from registered layout
		const built = windowManager.buildWidgetLayout('bottom_bar_left');
		this._window = built as IWindowContainer;

		if(!this._window)
		{
			throw new Error('Failed to construct toolbar window from layout');
		}

		// Find key children
		this._buttonContainer = this._window.getChildByName('toolbar_items');

		const leftContainer = this._window.getChildByName('arrow_container_left') as IWindowContainer | null;
		const rightContainer = this._window.getChildByName('arrow_container_right') as IWindowContainer | null;

		this._leftArrow = leftContainer?.getChildByName?.('collapse_left') ?? null;
		this._rightArrow = rightContainer?.getChildByName?.('collapse_right') ?? null;
		this._lineSeparator = (this._buttonContainer as IWindowContainer)?.findChildByName?.('line') ?? null;

		// Register click listeners on collapse arrows
		if(this._leftArrow)
		{
			this._leftArrow.addEventListener(WindowMouseEvent.CLICK, this.onCollapseToolbar);
		}

		if(this._rightArrow)
		{
			this._rightArrow.addEventListener(WindowMouseEvent.CLICK, this.onCollapseToolbar);
		}

		// Register click listeners on all TOGGLE-tagged regions
		const toggleChildren: IWindow[] = [];
		(this._window as IWindowContainer).groupChildrenWithTag('TOGGLE', toggleChildren, -1);

		for(const child of toggleChildren)
		{
			if(child)
			{
				child.addEventListener(WindowMouseEvent.CLICK, this.onIconClick);
				child.addEventListener(WindowMouseEvent.OVER, this.onIconHoverIn);
				child.addEventListener(WindowMouseEvent.OUT, this.onIconHoverOut);
			}
		}

		// Set initial icon visibility
		this.iconVisibility(HabboToolbarIconEnum.getIconName('HTIE_ICON_MEMENU') ?? '', false);
		this.iconVisibility(HabboToolbarIconEnum.getIconName('HTIE_ICON_INVENTORY') ?? '', false);
		this.iconVisibility(HabboToolbarIconEnum.getIconName('HTIE_ICON_WIRED_MENU') ?? '', false);

		const gamesEnabled = toolbar.getBoolean('games_icon_enabled');

		if(gamesEnabled)
		{
			this.iconVisibility(HabboToolbarIconEnum.getIconName('HTIE_ICON_GAMES') ?? '', true);
		}
		else
		{
			this.iconVisibility(HabboToolbarIconEnum.getIconName('HTIE_ICON_GAMES') ?? '', false);
		}

		this._newItemsNotificationEnabled = this.isNewItemsNotificationEnabled();
		this.checkSize();

		log.debug('BottomBarLeft constructed with IWindow tree');
	}

	/**
	 * Whether the view is disposed
	 */
	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * The root window of the toolbar
	 */
	get window(): IWindow | null
	{
		return this._window;
	}

	/**
	 * Set the toolbar state and update icon visibility by tags
	 *
	 * In AS3, this groups all TOGGLE-tagged children and sets their visibility
	 * based on the state's visibility tag (VISIBLE_ROOM, VISIBLE_HOTEL, etc.)
	 * with additional rules for specific icons (QUESTS, STORIES, BUILDER, etc.)
	 *
	 * @param state Toolbar state identifier
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as setToolbarState()
	 */
	public setToolbarState(state: string): void
	{
		if(!this._window)
		{
			return;
		}

		if(state === 'HTE_STATE_HIDDEN')
		{
			this._window.visible = false;
			return;
		}

		this._window.visible = true;

		if(state !== 'HTE_STATE_COLLAPSED')
		{
			this._lastState = state;
		}

		// Collect all TOGGLE-tagged children
		const toggleChildren: IWindow[] = [];
		(this._window as IWindowContainer).groupChildrenWithTag('TOGGLE', toggleChildren, -1);

		// Determine the visibility tag for this state
		let visibilityTag: string | null = null;

		switch(state)
		{
			case 'HTE_STATE_GAME_CENTER_VIEW':
				visibilityTag = 'VISIBLE_GAME_CENTER';
				this._window.position = { ...BottomBarLeft.DEFAULT_LOCATION };
				break;
			case 'HTE_STATE_HOTEL_VIEW':
				visibilityTag = 'VISIBLE_HOTEL';
				this._window.position = { ...BottomBarLeft.LANDING_VIEW_LOCATION };
				break;
			case 'HTE_STATE_NOOB_NOT_HOME':
				visibilityTag = 'VISIBLE_NOOB';
				this._window.position = { ...BottomBarLeft.DEFAULT_LOCATION };
				break;
			case 'HETE_STATE_NOOB_HOME':
				visibilityTag = 'VISIBLE_ROOM';
				this._window.position = { ...BottomBarLeft.DEFAULT_LOCATION };
				break;
			case 'HTE_STATE_ROOM_VIEW':
				visibilityTag = 'VISIBLE_ROOM';
				this._window.position = { ...BottomBarLeft.DEFAULT_LOCATION };
				break;
			case 'HTE_STATE_COLLAPSED':
				visibilityTag = 'VISIBLE_COLLAPSED';
				this._window.position = { ...BottomBarLeft.DEFAULT_LOCATION };
				break;
		}

		// Determine if we're in a room-like state (for CAMERA / WIRED_MENU)
		const isRoomState = state === 'HTE_STATE_ROOM_VIEW'
			|| state === 'HETE_STATE_NOOB_HOME'
			|| state === 'HTE_STATE_NOOB_NOT_HOME'
			|| (this._collapsed && (
				this._lastState === 'HTE_STATE_ROOM_VIEW'
				|| this._lastState === 'HETE_STATE_NOOB_HOME'
				|| this._lastState === 'HTE_STATE_NOOB_NOT_HOME'
			));

		// Set visibility of each TOGGLE child based on its tags
		for(const child of toggleChildren)
		{
			if(!child) continue;

			child.visible = visibilityTag !== null && child.tags.indexOf(visibilityTag) >= 0;

			// Apply specific per-icon rules
			if(child.name === 'QUESTS' && !this._collapsed)
			{
				child.visible = child.visible && !this._toolbar!.getBoolean('toolbar.hide.quests');
			}
			else if(child.name === 'STORIES' && !this._collapsed)
			{
				child.visible = child.visible && this._toolbar!.getBoolean('toolbar.stories.enabled');
			}
			else if(child.name === 'BUILDER' && !this._collapsed)
			{
				child.visible = child.visible && this._toolbar!.getBoolean('builders.club.enabled');
			}
			else if(child.name === 'GAMES')
			{
				child.visible = child.visible && this._toolbar!.getBoolean('games_icon_enabled');
			}
			else if(child.name === 'CAMERA')
			{
				const cameraPosition = this._toolbar!.getProperty('camera.launch.ui.position');
				const cameraAllowed = this._toolbar!.sessionDataManager?.isPerkAllowed?.('CAMERA') ?? false;
				child.visible = isRoomState && cameraPosition === 'bottom-icons' && cameraAllowed;
			}
			else if(child.name === 'WIRED_MENU')
			{
				child.visible = false;
			}
		}

		this.checkSize();
	}

	/**
	 * Set the visibility of a toolbar icon by name
	 *
	 * Finds the child window by name and sets its visible property.
	 *
	 * @param iconName Icon name string
	 * @param visible Whether the icon should be visible
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as iconVisibility()
	 */
	public iconVisibility(iconName: string, visible: boolean): void
	{
		if(!this._window || !iconName) return;

		const child = (this._window as IWindowContainer).findChildByName(iconName);

		if(child)
		{
			child.visible = visible;
		}

		this.checkSize();
	}

	/**
	 * Calculate the number of visible toolbar icons
	 *
	 * Collects all TOGGLE-tagged children and counts the visible ones.
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as calculateNewWidth()
	 */
	public calculateNewWidth(): number
	{
		if(!this._window) return 1;

		const toggleChildren: IWindow[] = [];
		(this._window as IWindowContainer).groupChildrenWithTag('TOGGLE', toggleChildren, -1);

		let count = 1;

		for(const child of toggleChildren)
		{
			if(child && child.visible)
			{
				count++;
			}
		}

		return count;
	}

	/**
	 * Get the icon location rectangle for a given icon id
	 *
	 * Maps the icon ID to a child name, finds the child, and returns
	 * its global rectangle.
	 *
	 * @param iconId Icon identifier
	 * @returns Rectangle or null if not found
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as getIconLocation()
	 */
	public getIconLocation(iconId: string): { x: number; y: number; width: number; height: number } | null
	{
		if(!this._window) return null;

		const iconName = this.getIconChildName(iconId);

		if(!iconName) return null;

		const child = (this._window as IWindowContainer).findChildByName(iconName);

		if(child && child.visible)
		{
			const rect = { x: 0, y: 0, width: 0, height: 0 };
			child.getGlobalRectangle(rect);
			return rect;
		}

		return null;
	}

	/**
	 * Set the unseen item count for a toolbar icon
	 *
	 * @param iconId Icon identifier
	 * @param count The count to display
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as setUnseenItemCount()
	 */
	public setUnseenItemCount(iconId: string, count: number): void
	{
		const iconName = HabboToolbarIconEnum.getIconName(iconId);

		if(!iconName)
		{
			log.warn(`[Toolbar] Unknown icon type for unseen item counter for iconId: ${iconId}`);
			return;
		}

		this._unseenItemCounters.set(iconId, count);
	}

	/**
	 * Check if new items notification is enabled
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as isNewItemsNotificationEnabled()
	 */
	public isNewItemsNotificationEnabled(): boolean
	{
		if(!this._toolbar) return false;
		return this._toolbar.getBoolean('toolbar.new_additions.notification.enabled');
	}

	/**
	 * Set the on duty state
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as set onDuty()
	 */
	set onDuty(value: boolean)
	{
		if(!this._window) return;

		const guideIcon = (this._window as IWindowContainer).findChildByName('guide_icon');

		if(guideIcon)
		{
			guideIcon.visible = value;
		}
	}

	/**
	 * Set the unseen achievement count
	 */
	set unseenAchievementCount(value: number)
	{
		this._unseenAchievementCount = value;
	}

	/**
	 * Set the unseen mini mail message count
	 */
	set unseenMiniMailMessageCount(value: number)
	{
		this._unseenMiniMailMessageCount = value;
	}

	/**
	 * Set the unseen forums count
	 */
	set unseenForumsCount(value: number)
	{
		this._unseenForumsCount = value;
	}

	/**
	 * Total unseen count across me-menu categories
	 */
	get unseenMeMenuCount(): number
	{
		return this._unseenMiniMailMessageCount + this._unseenAchievementCount + this._unseenForumsCount;
	}

	/**
	 * Get the me menu controller
	 */
	get memenu(): MeMenuNewController | null
	{
		return this._meMenuController;
	}

	/**
	 * The link pattern for toolbar links
	 */
	get linkPattern(): string
	{
		return 'toolbar/';
	}

	/**
	 * Handle a received link event
	 *
	 * @param link The link string
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as linkReceived()
	 */
	public linkReceived(link: string): void
	{
		const parts = link.split('/');

		if(parts.length < 2) return;

		switch(parts[1])
		{
			case 'memenu':
				this._meMenuController?.toggleVisibility();
				break;
			case 'highlight':
				if(parts.length <= 2) return;
				// Highlight handling is delegated to the UI layer
				break;
			default:
				log.warn(`Toolbar unknown link-type received: ${parts[1]}`);
		}
	}

	/**
	 * Get the toolbar area width
	 *
	 * In AS3, returns the line separator position when not collapsed,
	 * or the COLLAPSED_MARGIN when collapsed.
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as getToolbarAreaWidth()
	 */
	public getToolbarAreaWidth(): number
	{
		if(!this._lineSeparator || !this._lineSeparator.parent)
		{
			return 0;
		}

		return this._collapsed
			? BottomBarLeft.COLLAPSED_MARGIN
			: this._lineSeparator.x + this._lineSeparator.parent.x;
	}

	/**
	 * Whether the bar is collapsed
	 */
	get collapsed(): boolean
	{
		return this._collapsed;
	}

	/**
	 * Toggle collapse state
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as onCollapseToolsBar()
	 */
	public toggleCollapse(): void
	{
		this._collapsed = !this._collapsed;

		if(this._collapsed)
		{
			this.setToolbarState('HTE_STATE_COLLAPSED');
		}
		else
		{
			this.setToolbarState(this._lastState);
		}

		this.checkSize();
	}

	/**
	 * Map an icon ID to its child window name in the toolbar layout
	 *
	 * @param iconId The icon identifier
	 * @returns The child window name, or null
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as getIconName()
	 */
	private getIconChildName(iconId: string): string | null
	{
		switch(iconId)
		{
			case 'HTIE_ICON_CATALOGUE': return 'icons_toolbar_catalogue';
			case 'HTIE_ICON_INVENTORY': return 'icons_toolbar_inventory';
			case 'HTIE_ICON_MEMENU': return 'MEMENU';
			case 'HTIE_ICON_NAVIGATOR': return 'icons_toolbar_navigator';
			case 'HTIE_ICON_QUESTS': return 'icons_toolbar_quests';
			case 'HTIE_ICON_GAMES': return 'icons_toolbar_games';
			case 'HTIE_ICON_STORIES': return 'icons_toolbar_stories';
			case 'HTIE_ICON_RECEPTION': return 'icons_toolbar_reception';
			case 'HTIE_ICON_BUILDER': return 'icons_toolbar_builder';
			case 'HTIE_ICON_CAMERA': return 'icons_toolbar_camera';
			case 'HTIE_ICON_WIRED_MENU': return 'icons_toolbar_wired_menu';
			default: return null;
		}
	}

	/**
	 * Recalculate the toolbar size and position
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as checkSize()
	 */
	private checkSize(): void
	{
		if(!this._window || !this._windowManager)
		{
			return;
		}

		if(this._leftArrow)
		{
			this._leftArrow.visible = !this._collapsed;
		}

		if(this._rightArrow)
		{
			this._rightArrow.visible = this._collapsed;
		}

		// Position at the bottom of the desktop
		const desktop = this._window.desktop;

		if(desktop)
		{
			this._window.y = desktop.height - this._window.height;
		}

		// Width = ICON_REGION_WIDTH * visibleCount + WINDOW_RIGHT_PADDING + COLLAPSED_MARGIN_BASE
		this._window.width = BottomBarLeft.ICON_REGION_WIDTH * this.calculateNewWidth()
			+ BottomBarLeft.WINDOW_RIGHT_PADDING + 150;

		if(!this._collapsed && this._meMenuController)
		{
			this._meMenuController.reposition();
		}

		this._window.invalidate();
	}

	/**
	 * Handle icon click events
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as onIconClick()
	 */
	private onIconClick = (event: WindowEvent): void =>
	{
		if(!this._toolbar) return;

		const window = event.window;

		if(!window) return;

		const iconName = window.name;
		this._toolbar.toggleWindowVisibility(iconName);

		if(this._windowManager)
		{
			this._windowManager.hideMatchingHint(iconName);
		}
	};

	/**
	 * Handle icon hover mouse events (OVER / OUT).
	 *
	 * In AS3, swaps the ICON_BMP child's assetUri between _normal and _hover,
	 * and changes the ICON_BORDER background color.
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as onIconHoverMouseEvent()
	 */
	private onIconHoverIn = (event: WindowEvent): void =>
	{
		const target = event.window as unknown as IWindowContainer;

		if(!target) return;

		this.setIconHoverState(target, BottomBarLeft.ICON_MOUSE_OVER);
		this.setIconBgHoverState(target, BottomBarLeft.ICON_MOUSE_OVER);
	};

	private onIconHoverOut = (event: WindowEvent): void =>
	{
		const target = event.window as unknown as IWindowContainer;

		if(!target) return;

		this.setIconHoverState(target, BottomBarLeft.ICON_MOUSE_OUT);
		this.setIconBgHoverState(target, BottomBarLeft.ICON_MOUSE_OUT);
	};

	/**
	 * Swap the icon bitmap asset between _normal and _hover.
	 *
	 * Uses `findChildByTag("ICON_BMP")` to locate the bitmap,
	 * then sets `assetUri = name + suffix` (e.g. "icons_toolbar_navigator_hover").
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as setIconHoverState()
	 */
	private setIconHoverState(container: IWindowContainer, suffix: string): void
	{
		if(!container.findChildByTag) return;

		const iconBmp = container.findChildByTag('ICON_BMP');

		if(!iconBmp) return;

		// IStaticBitmapWrapperWindow — set assetUri = name + suffix
		const bmp = iconBmp as unknown as IStaticBitmapWrapperWindow;

		if(typeof bmp.assetUri === 'string')
		{
			bmp.assetUri = iconBmp.name + suffix;
		}
	}

	/**
	 * Change the ICON_BORDER background color on hover.
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as setIconBgHoverState()
	 */
	private setIconBgHoverState(container: IWindowContainer, suffix: string): void
	{
		if(suffix === BottomBarLeft.ICON_MOUSE_OVER)
		{
			(container as unknown as IWindow).color = BottomBarLeft.ICON_BG_COLOR_OVER;
		}
		else
		{
			(container as unknown as IWindow).color = BottomBarLeft.ICON_BG_COLOR_OUT;
		}
	}

	/**
	 * Handle collapse/expand toolbar click
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as onCollapseToolsBar()
	 */
	private onCollapseToolbar = (): void =>
	{
		this.toggleCollapse();
	};

	/**
	 * Dispose of this view and all its resources
	 *
	 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as dispose()
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		if(this._meMenuController)
		{
			this._meMenuController.dispose();
			this._meMenuController = null;
		}

		if(this._window)
		{
			this._window.dispose();
			this._window = null;
		}

		if(this._newItemsLabel)
		{
			this._newItemsLabel.dispose();
			this._newItemsLabel = null;
		}

		this._unseenItemCounters.clear();
		this._buttonContainer = null;
		this._leftArrow = null;
		this._rightArrow = null;
		this._lineSeparator = null;
		this._toolbar = null;
		this._windowManager = null;
		this._disposed = true;
	}
}
