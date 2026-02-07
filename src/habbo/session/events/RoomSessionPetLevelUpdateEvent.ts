import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session pet level update event
 *
 * @see source_as/habbo/session/events/RoomSessionPetLevelUpdateEvent.as
 */
export class RoomSessionPetLevelUpdateEvent extends RoomSessionEvent
{
	public static readonly PET_LEVEL_UPDATE = 'RSPLUE_PET_LEVEL_UPDATE';

	private _petId: number;

	get petId(): number
	{
		return this._petId;
	}

	private _level: number;

	get level(): number
	{
		return this._level;
	}

	constructor(session: IRoomSession, petId: number, level: number)
	{
		super(RoomSessionPetLevelUpdateEvent.PET_LEVEL_UPDATE, session);
		this._petId = petId;
		this._level = level;
	}
}
