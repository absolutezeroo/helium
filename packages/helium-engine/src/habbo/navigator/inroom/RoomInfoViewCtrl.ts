import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {GuestRoomData} from '../../communication/messages/incoming/navigator';
import {
	AddFavouriteRoomMessageComposer
} from '../../communication/messages/outgoing/navigator/AddFavouriteRoomMessageComposer';
import {
	DeleteFavouriteRoomMessageComposer
} from '../../communication/messages/outgoing/navigator/DeleteFavouriteRoomMessageComposer';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';
import {TagRenderer} from '../TagRenderer';
import {GuildInfoCtrl} from '../GuildInfoCtrl';

/**
 * Room info view controller for displaying room details in-room.
 *
 * Shows room name, owner, category, description, tags, guild info,
 * and action buttons (favourite, home, settings, report, etc.).
 *
 * @see sources/win63_version/habbo/navigator/inroom/RoomInfoViewCtrl.as
 */
export class RoomInfoViewCtrl
{
	private _navigator: IHabboTransitionalNavigator | null;
	private _guildInfoCtrl: GuildInfoCtrl;
	private _window: IWindow | null = null;
	private _tagRenderer: TagRenderer;
	private _embedExpanded: boolean = false;
	private _visible: boolean = false;

	constructor(navigator: IHabboTransitionalNavigator)
	{
		this._navigator = navigator;
		this._guildInfoCtrl = new GuildInfoCtrl(navigator);
		this._tagRenderer = new TagRenderer(navigator);
	}

	/**
	 * Toggles the room info visibility.
	 */
	toggle(): void
	{
		this._visible = !this._visible;

		if (this._visible)
		{
			this.refresh();
		}
		else
		{
			this.close();
		}
	}

	/**
	 * Closes the room info view.
	 */
	close(): void
	{
		this._visible = false;

		if (this._window)
		{
			this._window.visible = false;
		}
	}

	/**
	 * Reloads the room info.
	 */
	reload(): void
	{
		this.refresh();
	}

	/**
	 * Refreshes the room info display.
	 */
	refresh(): void
	{
		if (!this._navigator) return;

		const roomData = this._navigator.data.enteredGuestRoom;

		if (!roomData) return;

		this.refreshRoomDetails(roomData);
		this.refreshButtons(roomData);
	}

	/**
	 * Refreshes action buttons based on room state.
	 *
	 * @param roomData - The room data
	 */
	refreshButtons(roomData: GuestRoomData): void
	{
		if (!this._window || !this._navigator) return;

		const content = (this._window as any).content as IWindowContainer;

		if (!content) return;

		const isFav = this._navigator.isRoomFavorite(roomData.flatId);
		const isHome = this._navigator.isRoomHome(roomData.flatId);

		const addFavButton = content.findChildByName('add_fav');
		if (addFavButton) addFavButton.visible = !isFav;

		const removeFavButton = content.findChildByName('remove_fav');
		if (removeFavButton) removeFavButton.visible = isFav;

		const homeButton = content.findChildByName('make_home');
		if (homeButton) homeButton.visible = !isHome;
	}

	dispose(): void
	{
		this._tagRenderer.dispose();
		this._guildInfoCtrl.dispose();

		if (this._window)
		{
			this._window.dispose();
			this._window = null;
		}

		this._navigator = null;
	}

	/**
	 * Refreshes room detail fields.
	 *
	 * @param roomData - The room data
	 */
	private refreshRoomDetails(roomData: GuestRoomData): void
	{
		if (!this._window || !this._navigator) return;

		const content = (this._window as any).content as IWindowContainer;

		if (!content) return;

		const roomName = content.findChildByName('room_name') as ITextWindow | null;
		if (roomName) roomName.text = roomData.roomName;

		const ownerName = content.findChildByName('owner_name') as ITextWindow | null;
		if (ownerName) ownerName.text = roomData.showOwner ? roomData.ownerName : '';

		const description = content.findChildByName('room_desc') as ITextWindow | null;
		if (description)
		{
			description.text = roomData.description;
			description.height = description.textHeight + 10;
		}

		this._tagRenderer.refreshTags(content, roomData.tags);
		this._guildInfoCtrl.refresh(content, roomData);
	}

	private onAddFavouriteClick = (_event: WindowEvent): void =>
	{
		if (!this._navigator) return;

		const roomData = this._navigator.data.enteredGuestRoom;
		if (!roomData) return;

		this._navigator.send(new AddFavouriteRoomMessageComposer(roomData.flatId));
	};

	private onRemoveFavouriteClick = (_event: WindowEvent): void =>
	{
		if (!this._navigator) return;

		const roomData = this._navigator.data.enteredGuestRoom;
		if (!roomData) return;

		this._navigator.send(new DeleteFavouriteRoomMessageComposer(roomData.flatId));
	};
}
