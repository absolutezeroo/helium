/**
 * Simple data class holding a friend's user ID and name.
 * Used by RoomSettingsFriendListManager for room settings friend list display.
 *
 * @see source_as_win63/habbo/navigator/roomsettings/FriendEntryData.as
 */
export class FriendEntryData
{
	private _userId: number;
	private _userName: string;

	constructor(userId: number, userName: string)
	{
		this._userId = userId;
		this._userName = userName;
	}

	get userId(): number
	{
		return this._userId;
	}

	get userName(): string
	{
		return this._userName;
	}
}
