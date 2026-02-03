/**
 * RoomSpriteMouseEvent
 *
 * Based on AS3: com.sulake.room.events.RoomSpriteMouseEvent
 *
 * Mouse event data for room sprite interactions.
 */
export class RoomSpriteMouseEvent
{
	private _type: string = '';
	private _eventId: string = '';
	private _canvasId: string = '';
	private _spriteTag: string = '';
	private _screenX: number = 0;
	private _screenY: number = 0;
	private _localX: number = 0;
	private _localY: number = 0;
	private _ctrlKey: boolean = false;
	private _altKey: boolean = false;
	private _shiftKey: boolean = false;
	private _buttonDown: boolean = false;
	private _spriteOffsetX: number = 0;
	private _spriteOffsetY: number = 0;

	constructor(
		type: string,
		eventId: string,
		canvasId: string,
		spriteTag: string,
		screenX: number,
		screenY: number,
		localX: number = 0,
		localY: number = 0,
		ctrlKey: boolean = false,
		altKey: boolean = false,
		shiftKey: boolean = false,
		buttonDown: boolean = false
	)
	{
		this._type = type;
		this._eventId = eventId;
		this._canvasId = canvasId;
		this._spriteTag = spriteTag;
		this._screenX = screenX;
		this._screenY = screenY;
		this._localX = localX;
		this._localY = localY;
		this._ctrlKey = ctrlKey;
		this._altKey = altKey;
		this._shiftKey = shiftKey;
		this._buttonDown = buttonDown;
	}

	get type(): string
	{
		return this._type;
	}

	get eventId(): string
	{
		return this._eventId;
	}

	get canvasId(): string
	{
		return this._canvasId;
	}

	get spriteTag(): string
	{
		return this._spriteTag;
	}

	get screenX(): number
	{
		return this._screenX;
	}

	get screenY(): number
	{
		return this._screenY;
	}

	get localX(): number
	{
		return this._localX;
	}

	get localY(): number
	{
		return this._localY;
	}

	get ctrlKey(): boolean
	{
		return this._ctrlKey;
	}

	get altKey(): boolean
	{
		return this._altKey;
	}

	get shiftKey(): boolean
	{
		return this._shiftKey;
	}

	get buttonDown(): boolean
	{
		return this._buttonDown;
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
