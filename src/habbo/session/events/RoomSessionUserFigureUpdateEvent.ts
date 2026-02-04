import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session user figure update event
 *
 * Based on AS3: com.sulake.habbo.session.events.RoomSessionUserFigureUpdateEvent
 */
export class RoomSessionUserFigureUpdateEvent extends RoomSessionEvent
{
	public static readonly RSUFE_FIGURE_UPDATE = 'RSUFE_FIGURE_UPDATE';

	private _roomIndex: number;
	private _figure: string;
	private _sex: string;
	private _customInfo: string;
	private _achievementScore: number;

	constructor(
		session: IRoomSession,
		roomIndex: number,
		figure: string,
		sex: string,
		customInfo: string,
		achievementScore: number
	)
	{
		super(RoomSessionUserFigureUpdateEvent.RSUFE_FIGURE_UPDATE, session);
		this._roomIndex = roomIndex;
		this._figure = figure;
		this._sex = sex;
		this._customInfo = customInfo;
		this._achievementScore = achievementScore;
	}

	get roomIndex(): number
	{
		return this._roomIndex;
	}

	get figure(): string
	{
		return this._figure;
	}

	get sex(): string
	{
		return this._sex;
	}

	get customInfo(): string
	{
		return this._customInfo;
	}

	get achievementScore(): number
	{
		return this._achievementScore;
	}
}
