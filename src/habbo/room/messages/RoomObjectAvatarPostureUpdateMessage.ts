/**
 * RoomObjectAvatarPostureUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarPostureUpdateMessage
 *
 * Update message for avatar posture (sit, lay, std, etc.).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarPostureUpdateMessage extends RoomObjectUpdateMessage
{
	private _postureType: string;
	private _parameter: string;

	constructor(postureType: string, parameter: string = '')
	{
		super(null, null);
		this._postureType = postureType;
		this._parameter = parameter;
	}

	get postureType(): string
	{
		return this._postureType;
	}

	get parameter(): string
	{
		return this._parameter;
	}
}
