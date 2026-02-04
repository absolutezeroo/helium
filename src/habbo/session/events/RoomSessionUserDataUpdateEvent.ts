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

	private _addedUsers: unknown[];

	constructor(session: IRoomSession, addedUsers: unknown[] = [])
	{
		super(RoomSessionUserDataUpdateEvent.RSUDUE_USER_DATA_UPDATE, session);
		this._addedUsers = addedUsers;
	}

	get addedUsers(): unknown[]
	{
		return this._addedUsers;
	}
}
