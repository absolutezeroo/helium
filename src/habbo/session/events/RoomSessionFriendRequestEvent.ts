import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session friend request event
 *
 * @see source_as/habbo/session/events/RoomSessionFriendRequestEvent.as
 */
export class RoomSessionFriendRequestEvent extends RoomSessionEvent
{
	public static readonly FRIEND_REQUEST = 'RSFRE_FRIEND_REQUEST';

	private _requestId: number;
	private _userId: number;
	private _userName: string;

	constructor(session: IRoomSession, requestId: number, userId: number, userName: string, openLandingPage: boolean = false)
	{
		super(RoomSessionFriendRequestEvent.FRIEND_REQUEST, session, openLandingPage);
		this._requestId = requestId;
		this._userId = userId;
		this._userName = userName;
	}

	get requestId(): number
	{
		return this._requestId;
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
