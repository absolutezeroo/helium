import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session user data update event
 *
 * Based on AS3: com.sulake.habbo.session.events.RoomSessionUserDataUpdateEvent
 */
export class RoomSessionUserDataUpdateEvent extends RoomSessionEvent
{
	public static readonly RSUDUE_USER_DATA_UPDATE = 'RSUDUE_USER_DATA_UPDATE';

	constructor(session: IRoomSession, addedUsers: unknown[] = [])
	{
		super(RoomSessionUserDataUpdateEvent.RSUDUE_USER_DATA_UPDATE, session);
		this._addedUsers = addedUsers;
	}

	private _addedUsers: unknown[];

	get addedUsers(): unknown[]
	{
		return this._addedUsers;
	}
}
