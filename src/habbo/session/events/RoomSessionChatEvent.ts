import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session chat event
 *
 * Based on AS3: com.sulake.habbo.session.events.RoomSessionChatEvent
 */
export class RoomSessionChatEvent extends RoomSessionEvent
{
	public static readonly RSCE_CHAT_EVENT = 'RSCE_CHAT_EVENT';
	public static readonly RSCE_FLOOD_EVENT = 'RSCE_FLOOD_EVENT';

	// Chat types
	public static readonly CHAT_TYPE_SPEAK = 0;
	public static readonly CHAT_TYPE_WHISPER = 1;
	public static readonly CHAT_TYPE_SHOUT = 2;
	public static readonly CHAT_TYPE_RESPECT = 3;
	public static readonly CHAT_TYPE_PET_RESPECT = 4;
	public static readonly CHAT_TYPE_HAND_ITEM_RECEIVED = 5;
	public static readonly CHAT_TYPE_PET_TREAT = 6;
	public static readonly CHAT_TYPE_PET_REVIVE = 7;
	public static readonly CHAT_TYPE_PET_REBREED = 8;
	public static readonly CHAT_TYPE_PET_SPEED = 9;
	public static readonly CHAT_TYPE_MUTE_REMAINING = 10;

	private _userId: number;
	private _text: string;
	private _chatType: number;
	private _styleId: number;
	private _links: string[] | null;
	private _extraParam: number;

	constructor(
		type: string,
		session: IRoomSession,
		userId: number,
		text: string,
		chatType: number,
		styleId: number,
		links: string[] | null = null,
		extraParam: number = -1
	)
	{
		super(type, session);
		this._userId = userId;
		this._text = text;
		this._chatType = chatType;
		this._styleId = styleId;
		this._links = links;
		this._extraParam = extraParam;
	}

	get userId(): number
	{
		return this._userId;
	}

	get text(): string
	{
		return this._text;
	}

	get chatType(): number
	{
		return this._chatType;
	}

	get styleId(): number
	{
		return this._styleId;
	}

	get links(): string[] | null
	{
		return this._links;
	}

	get extraParam(): number
	{
		return this._extraParam;
	}
}
