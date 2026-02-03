/**
 * RoomObjectRoomAdEvent
 *
 * Based on AS3: com.sulake.habbo.room.events.RoomObjectRoomAdEvent
 *
 * Event dispatched for room advertisement interactions.
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectRoomAdEvent extends RoomObjectEvent
{
	public static readonly RORAE_ROOM_AD_TOOLTIP_SHOW = 'RORAE_ROOM_AD_TOOLTIP_SHOW';
	public static readonly RORAE_ROOM_AD_TOOLTIP_HIDE = 'RORAE_ROOM_AD_TOOLTIP_HIDE';
	public static readonly RORAE_ROOM_AD_FURNI_CLICK = 'RORAE_ROOM_AD_FURNI_CLICK';
	public static readonly RORAE_ROOM_AD_FURNI_DOUBLE_CLICK = 'RORAE_ROOM_AD_FURNI_DOUBLE_CLICK';

	private _imageUrl: string | null;
	private _clickUrl: string | null;

	constructor(type: string, object: IRoomObject | null, imageUrl: string | null = null, clickUrl: string | null = null)
	{
		super(type, object);
		this._imageUrl = imageUrl;
		this._clickUrl = clickUrl;
	}

	get imageUrl(): string | null
	{
		return this._imageUrl;
	}

	get clickUrl(): string | null
	{
		return this._clickUrl;
	}
}
