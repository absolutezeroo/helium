import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session user badges event
 *
 * Based on AS3: com.sulake.habbo.session.events.RoomSessionUserBadgesEvent
 */
export class RoomSessionUserBadgesEvent extends RoomSessionEvent
{
	public static readonly RSUBE_BADGES = 'RSUBE_BADGES';

	private _userId: number;
	private _badges: string[];

	constructor(session: IRoomSession, userId: number, badges: string[])
	{
		super(RoomSessionUserBadgesEvent.RSUBE_BADGES, session);
		this._userId = userId;
		this._badges = badges;
	}

	get userId(): number
	{
		return this._userId;
	}

	get badges(): string[]
	{
		return this._badges;
	}
}
