import type {HabboToolbar} from './HabboToolbar';
import type {MeMenuNewController} from './memenu/MeMenuNewController';
import {HabboToolbarIconEnum} from './HabboToolbarIconEnum';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('BottomBarLeft');

/**
 * Horizontal bottom bar with icon click handlers, unseen counters, and collapse
 *
 * In AS3 this builds a horizontal toolbar from XML, manages icon visibility by
 * toolbar state tags, handles collapse/expand, and routes icon clicks to
 * toggleWindowVisibility. In Helium, rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/BottomBarLeft.as
 */
export class BottomBarLeft
{
	private static readonly DEFAULT_LOCATION = { x: 0, y: 500 };
	private static readonly LANDING_VIEW_LOCATION = { x: 0, y: 500 };
	private static readonly ICON_BG_COLOR_OVER: number = 0x716769;
	private static readonly ICON_BG_COLOR_OUT: number = 0x57504D;
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
	private _unseenItemCounters: Map<string, unknown> = new Map();
	private _newItemsNotificationEnabled: boolean = false;
	private _newItemsLabelVisible: boolean = false;
	private _collapsed: boolean = false;
	private _lastState: string = '';
	private _iconVisibility: Map<string, boolean> = new Map();
	private _unseenAchievementCount: number = 0;
	private _unseenMiniMailMessageCount: number = 0;
	private _unseenForumsCount: number = 0;
	private _meMenuController: MeMenuNewController | null = null;
	private _visible: boolean = true;
	private _position = { ...BottomBarLeft.DEFAULT_LOCATION };

	constructor(toolbar: HabboToolbar)
	{
		this._toolbar = toolbar;

		this._iconVisibility.set(HabboToolbarIconEnum.getIconName('HTIE_ICON_MEMENU') ?? '', false);
		this._iconVisibility.set(HabboToolbarIconEnum.getIconName('HTIE_ICON_INVENTORY') ?? '', false);
		this._iconVisibility.set(HabboToolbarIconEnum.getIconName('HTIE_ICON_WIRED_MENU') ?? '', false);

		const gamesEnabled = toolbar.getBoolean('games_icon_enabled');
		this._iconVisibility.set(
			HabboToolbarIconEnum.getIconName('HTIE_ICON_GAMES') ?? '',
			gamesEnabled
		);

		this._newItemsNotificationEnabled = this.isNewItemsNotificationEnabled();

		log.debug('BottomBarLeft constructed');
	}

	/**
	 * Whether the view is disposed
	 */
	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Set the toolbar state and update icon visibility by tags
	 *
	 * @param state Toolbar state identifier
	 */
	public setToolbarState(state: string): void
	{
		if(state === 'HTE_STATE_HIDDEN')
		{
			this._visible = false;
			return;
		}

		this._visible = true;

		if(state !== 'HTE_STATE_COLLAPSED')
		{
			this._lastState = state;
		}

		switch(state)
		{
			case 'HTE_STATE_GAME_CENTER_VIEW':
				this._position = { ...BottomBarLeft.DEFAULT_LOCATION };
				break;
			case 'HTE_STATE_HOTEL_VIEW':
				this._position = { ...BottomBarLeft.LANDING_VIEW_LOCATION };
				break;
			case 'HTE_STATE_NOOB_NOT_HOME':
				this._position = { ...BottomBarLeft.DEFAULT_LOCATION };
				break;
			case 'HETE_STATE_NOOB_HOME':
				this._position = { ...BottomBarLeft.DEFAULT_LOCATION };
				break;
			case 'HTE_STATE_ROOM_VIEW':
				this._position = { ...BottomBarLeft.DEFAULT_LOCATION };
				break;
			case 'HTE_STATE_COLLAPSED':
				this._position = { ...BottomBarLeft.DEFAULT_LOCATION };
				break;
		}

		this.checkSize();
	}

	/**
	 * Set the visibility of a toolbar icon
	 *
	 * @param iconName Icon name string
	 * @param visible Whether the icon should be visible
	 */
	public iconVisibility(iconName: string, visible: boolean): void
	{
		this._iconVisibility.set(iconName, visible);
		this.checkSize();
	}

	/**
	 * Calculate the number of visible toolbar icons
	 */
	public calculateNewWidth(): number
	{
		let count = 1;

		for(const visible of this._iconVisibility.values())
		{
			if(visible) count++;
		}

		return count;
	}

	/**
	 * Get the icon location rectangle for a given icon id
	 *
	 * @param iconId Icon identifier
	 * @returns Rectangle or null if not found
	 */
	public getIconLocation(iconId: string): { x: number; y: number; width: number; height: number } | null
	{
		// In Helium, icon positions are managed by the UI layer
		return null;
	}

	/**
	 * Set the unseen item count for a toolbar icon
	 *
	 * @param iconId Icon identifier
	 * @param count The count to display
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
	 */
	public isNewItemsNotificationEnabled(): boolean
	{
		if(!this._toolbar) return false;
		return this._toolbar.getBoolean('toolbar.new_additions.notification.enabled');
	}

	/**
	 * Set the on duty state
	 */
	set onDuty(value: boolean)
	{
		// Metadata only - UI layer renders the guide icon
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
	 */
	public getToolbarAreaWidth(): number
	{
		return this._collapsed ? BottomBarLeft.COLLAPSED_MARGIN : 0;
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

	private checkSize(): void
	{
		if(!this._toolbar) return;

		if(!this._collapsed && this._meMenuController)
		{
			this._meMenuController.reposition();
		}
	}

	/**
	 * Dispose of this view and all its resources
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		if(this._meMenuController)
		{
			this._meMenuController.dispose();
			this._meMenuController = null;
		}

		this._unseenItemCounters.clear();
		this._iconVisibility.clear();
		this._toolbar = null;
		this._disposed = true;
	}
}
