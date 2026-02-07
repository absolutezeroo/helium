/**
 * Dimmer preset item
 *
 * @see source_as/habbo/session/events/RoomSessionDimmerPresetsEventPresetItem.as
 */
export class RoomSessionDimmerPresetsEventPresetItem
{
	private _id: number;
	private _type: number;
	private _color: number;
	private _light: number;

	constructor(id: number, type: number, color: number, light: number)
	{
		this._id = id;
		this._type = type;
		this._color = color;
		this._light = light;
	}

	get id(): number
	{
		return this._id;
	}

	get type(): number
	{
		return this._type;
	}

	get color(): number
	{
		return this._color;
	}

	get light(): number
	{
		return this._light;
	}
}
