import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session dance event
 *
 * Based on AS3: com.sulake.habbo.session.events.RoomSessionDanceEvent
 */
export class RoomSessionDanceEvent extends RoomSessionEvent
{
	public static readonly RSDE_DANCE = 'RSDE_DANCE';

	private _userId: number;
	private _danceStyle: number;

	constructor(session: IRoomSession, userId: number, danceStyle: number)
	{
		super(RoomSessionDanceEvent.RSDE_DANCE, session);
		this._userId = userId;
		this._danceStyle = danceStyle;
	}

	get userId(): number
	{
		return this._userId;
	}

	get danceStyle(): number
	{
		return this._danceStyle;
	}
}
