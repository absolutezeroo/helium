import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data for a single hall of fame entry (user ranking).
 * @see source_nitro_renderer/.../parser/quest/HallOfFameEntryData.ts
 */
export class HallOfFameEntryData
{
	private _userId: number;
	private _userName: string;
	private _figure: string;
	private _rank: number;
	private _currentScore: number;

	constructor(wrapper: IMessageDataWrapper)
	{
		this._userId = wrapper.readInt();
		this._userName = wrapper.readString();
		this._figure = wrapper.readString();
		this._rank = wrapper.readInt();
		this._currentScore = wrapper.readInt();
	}

	get userId(): number { return this._userId; }
	get userName(): string { return this._userName; }
	get figure(): string { return this._figure; }
	get rank(): number { return this._rank; }
	get currentScore(): number { return this._currentScore; }
}
