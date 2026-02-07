import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session poll event
 *
 * @see source_as/habbo/session/events/RoomSessionPollEvent.as
 */
export class RoomSessionPollEvent extends RoomSessionEvent
{
	public static readonly OFFER = 'RSPE_POLL_OFFER';
	public static readonly ERROR = 'RSPE_POLL_ERROR';
	public static readonly CONTENT = 'RSPE_POLL_CONTENT';

	private _id: number;
	private _headline: string = '';
	private _summary: string = '';
	private _numQuestions: number = 0;
	private _startMessage: string = '';
	private _endMessage: string = '';
	private _questionArray: unknown[] | null = null;
	private _npsPoll: boolean = false;

	constructor(type: string, session: IRoomSession, id: number)
	{
		super(type, session);
		this._id = id;
	}

	get id(): number
	{
		return this._id;
	}

	get headline(): string
	{
		return this._headline;
	}

	set headline(value: string)
	{
		this._headline = value;
	}

	get summary(): string
	{
		return this._summary;
	}

	set summary(value: string)
	{
		this._summary = value;
	}

	get numQuestions(): number
	{
		return this._numQuestions;
	}

	set numQuestions(value: number)
	{
		this._numQuestions = value;
	}

	get startMessage(): string
	{
		return this._startMessage;
	}

	set startMessage(value: string)
	{
		this._startMessage = value;
	}

	get endMessage(): string
	{
		return this._endMessage;
	}

	set endMessage(value: string)
	{
		this._endMessage = value;
	}

	get questionArray(): unknown[] | null
	{
		return this._questionArray;
	}

	set questionArray(value: unknown[] | null)
	{
		this._questionArray = value;
	}

	get npsPoll(): boolean
	{
		return this._npsPoll;
	}

	set npsPoll(value: boolean)
	{
		this._npsPoll = value;
	}
}
