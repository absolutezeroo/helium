/**
 * RoomObjectAvatarExperienceUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarExperienceUpdateMessage
 *
 * Update message for pet experience gain.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarExperienceUpdateMessage extends RoomObjectUpdateMessage
{
	private _gainedExperience: number;

	constructor(gainedExperience: number)
	{
		super(null, null);
		this._gainedExperience = gainedExperience;
	}

	get gainedExperience(): number
	{
		return this._gainedExperience;
	}
}
