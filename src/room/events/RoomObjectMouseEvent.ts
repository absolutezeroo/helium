/**
 * RoomObjectMouseEvent
 *
 * Based on AS3: com.sulake.room.events.RoomObjectMouseEvent
 *
 * Mouse event for room objects.
 */
import {RoomObjectEvent} from './RoomObjectEvent';
import type {IRoomObject} from '../object/IRoomObject';

export class RoomObjectMouseEvent extends RoomObjectEvent
{
	public static readonly ROE_MOUSE_MOVE = 'ROE_MOUSE_MOVE';
	public static readonly ROE_MOUSE_CLICK = 'ROE_MOUSE_CLICK';
	public static readonly ROE_MOUSE_DOUBLE_CLICK = 'ROE_MOUSE_DOUBLE_CLICK';
	public static readonly ROE_MOUSE_DOWN = 'ROE_MOUSE_DOWN';
	public static readonly ROE_MOUSE_UP = 'ROE_MOUSE_UP';
	public static readonly ROE_MOUSE_ENTER = 'ROE_MOUSE_ENTER';
	public static readonly ROE_MOUSE_LEAVE = 'ROE_MOUSE_LEAVE';

	private _eventId: string;
	private _altKey: boolean;
	private _ctrlKey: boolean;
	private _shiftKey: boolean;
	private _buttonDown: boolean;
	private _localX: number = 0;
	private _localY: number = 0;
	private _spriteOffsetX: number = 0;
	private _spriteOffsetY: number = 0;

	constructor(
		type: string,
		object: IRoomObject | null,
		eventId: string = '',
		altKey: boolean = false,
		ctrlKey: boolean = false,
		shiftKey: boolean = false,
		buttonDown: boolean = false
	)
	{
		super(type, object);
		this._eventId = eventId;
		this._altKey = altKey;
		this._ctrlKey = ctrlKey;
		this._shiftKey = shiftKey;
		this._buttonDown = buttonDown;
	}

	get eventId(): string
	{
		return this._eventId;
	}

	get altKey(): boolean
	{
		return this._altKey;
	}

	get ctrlKey(): boolean
	{
		return this._ctrlKey;
	}

	get shiftKey(): boolean
	{
		return this._shiftKey;
	}

	get buttonDown(): boolean
	{
		return this._buttonDown;
	}

	get localX(): number
	{
		return this._localX;
	}

	set localX(value: number)
	{
		this._localX = value;
	}

	get localY(): number
	{
		return this._localY;
	}

	set localY(value: number)
	{
		this._localY = value;
	}

	get spriteOffsetX(): number
	{
		return this._spriteOffsetX;
	}

	set spriteOffsetX(value: number)
	{
		this._spriteOffsetX = value;
	}

	get spriteOffsetY(): number
	{
		return this._spriteOffsetY;
	}

	set spriteOffsetY(value: number)
	{
		this._spriteOffsetY = value;
	}
}
