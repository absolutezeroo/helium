import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import type {HabboNewNavigator} from '../HabboNewNavigator';

/**
 * Room info popup bubble shown when hovering over room entries.
 *
 * Stub implementation — the full popup is ~390 lines with owner links,
 * group badges, favorites, tags, properties, etc.
 * This provides the essential structure for showing/hiding.
 *
 * @see sources/win63_version/habbo/navigator/view/RoomInfoPopup.as
 */
export class RoomInfoPopup
{
	private _navigator: HabboNewNavigator;
	private _window: IWindowContainer | null = null;
	private _roomData: GuestRoomData | null = null;

	constructor(navigator: HabboNewNavigator)
	{
		this._navigator = navigator;
	}

	/**
	 * Whether the popup is currently visible.
	 *
	 * @see sources/win63_version/habbo/navigator/view/RoomInfoPopup.as get visible()
	 */
	get visible(): boolean
	{
		if (!this._window) return false;

		return this._window.visible;
	}

	/**
	 * Show or hide the popup.
	 *
	 * @param visible - Whether to show the popup
	 *
	 * @see sources/win63_version/habbo/navigator/view/RoomInfoPopup.as show()
	 */
	show(visible: boolean): void
	{
		if (visible)
		{
			if (!this._window)
			{
				this.createWindow();
			}

			if (this._window)
			{
				this._window.visible = true;
			}
		}
		else if (this._window)
		{
			this._window.visible = false;
		}
	}

	/**
	 * Show the popup at a specific position.
	 *
	 * @param visible - Whether to show the popup
	 * @param x - The x position
	 * @param y - The y position
	 *
	 * @see sources/win63_version/habbo/navigator/view/RoomInfoPopup.as showAt()
	 */
	showAt(visible: boolean, x: number, y: number): void
	{
		this.show(visible);

		if (visible && this._window)
		{
			this._window.x = x;
			this._window.y = y - this._window.height / 2;
			this._window.activate();
		}
	}

	/**
	 * Set the room data to display.
	 *
	 * @param data - The guest room data
	 *
	 * @see sources/win63_version/habbo/navigator/view/RoomInfoPopup.as setData()
	 */
	setData(data: GuestRoomData): void
	{
		this._roomData = data;
	}

	/**
	 * Get the global rectangle of the popup window.
	 *
	 * @param out - The rectangle to populate
	 *
	 * @see sources/win63_version/habbo/navigator/view/RoomInfoPopup.as getGlobalRectangle()
	 */
	getGlobalRectangle(out: { x: number; y: number; width: number; height: number }): void
	{
		if (this._window)
		{
			this._window.getGlobalRectangle(out);
		}
	}

	/**
	 * Dispose the popup and clean up.
	 */
	dispose(): void
	{
		if (this._window)
		{
			this._window.destroy();
			this._window = null;
		}

		this._roomData = null;
	}

	private createWindow(): void
	{
		const windowManager = this._navigator.windowManager;

		if (!windowManager) return;

		const built = windowManager.buildWidgetLayout('room_info_popup_bubble');

		if (built)
		{
			this._window = built as IWindowContainer;
		}
	}
}
