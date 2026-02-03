/**
 * RoomObjectAvatarFigureUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarFigureUpdateMessage
 *
 * Update message for avatar figure (look) and gender.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarFigureUpdateMessage extends RoomObjectUpdateMessage
{
	private _figure: string;
	private _gender: string;
	private _race: string;
	private _isRiding: boolean;

	constructor(figure: string, gender: string, race: string = '', isRiding: boolean = false)
	{
		super(null, null);
		this._figure = figure;
		this._gender = gender;
		this._race = race;
		this._isRiding = isRiding;
	}

	get figure(): string
	{
		return this._figure;
	}

	get gender(): string
	{
		return this._gender;
	}

	get race(): string
	{
		return this._race;
	}

	get isRiding(): boolean
	{
		return this._isRiding;
	}
}
