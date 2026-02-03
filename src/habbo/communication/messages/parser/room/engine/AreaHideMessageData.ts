/**
 * AreaHideMessageData
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.engine.AreaHideMessageData
 *
 * Data for area hide furniture zones.
 */
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class AreaHideMessageData
{
	private _furniId: number;
	private _on: boolean;
	private _rootX: number;
	private _rootY: number;
	private _width: number;
	private _length: number;
	private _invert: boolean;

	constructor(wrapper: IMessageDataWrapper)
	{
		this._furniId = wrapper.readInt();
		this._on = wrapper.readBoolean();
		this._rootX = wrapper.readInt();
		this._rootY = wrapper.readInt();
		this._width = wrapper.readInt();
		this._length = wrapper.readInt();
		this._invert = wrapper.readBoolean();
	}

	get furniId(): number
	{
		return this._furniId;
	}

	get on(): boolean
	{
		return this._on;
	}

	get rootX(): number
	{
		return this._rootX;
	}

	get rootY(): number
	{
		return this._rootY;
	}

	get width(): number
	{
		return this._width;
	}

	get length(): number
	{
		return this._length;
	}

	get invert(): boolean
	{
		return this._invert;
	}
}
