/**
 * RoomObjectAvatarPlayingGameMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarPlayingGameMessage
 *
 * Update message for avatar playing game state.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarPlayingGameMessage extends RoomObjectUpdateMessage
{
	private _isPlayingGame: boolean;

	constructor(isPlayingGame: boolean)
	{
		super(null, null);
		this._isPlayingGame = isPlayingGame;
	}

	get isPlayingGame(): boolean
	{
		return this._isPlayingGame;
	}
}
