import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Campaign calendar data model
 *
 * Stores the full state of a campaign calendar: name, image, current day,
 * total days, which days were opened, and which were missed.
 *
 * @see source_as/habbo/communication/messages/parser/campaign/class_1641.as
 */
export class CampaignCalendarData
{
	private _campaignName: string = '';
	private _campaignImage: string = '';
	private _currentDay: number = 0;
	private _campaignDays: number = 0;
	private _openedDays: number[] = [];
	private _missedDays: number[] = [];

	get campaignName(): string
	{
		return this._campaignName;
	}

	set campaignName(value: string)
	{
		this._campaignName = value;
	}

	get campaignImage(): string
	{
		return this._campaignImage;
	}

	set campaignImage(value: string)
	{
		this._campaignImage = value;
	}

	get currentDay(): number
	{
		return this._currentDay;
	}

	set currentDay(value: number)
	{
		this._currentDay = value;
	}

	get campaignDays(): number
	{
		return this._campaignDays;
	}

	set campaignDays(value: number)
	{
		this._campaignDays = value;
	}

	get openedDays(): number[]
	{
		return this._openedDays;
	}

	set openedDays(value: number[])
	{
		this._openedDays = value;
	}

	get missedDays(): number[]
	{
		return this._missedDays;
	}

	set missedDays(value: number[])
	{
		this._missedDays = value;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._campaignName = wrapper.readString();
		this._campaignImage = wrapper.readString();
		this._currentDay = wrapper.readInt();
		this._campaignDays = wrapper.readInt();

		this._openedDays = [];
		let count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._openedDays.push(wrapper.readInt());
		}

		this._missedDays = [];
		count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._missedDays.push(wrapper.readInt());
		}

		return true;
	}

	clone(): CampaignCalendarData
	{
		const copy = new CampaignCalendarData();
		copy.campaignName = this._campaignName;
		copy.campaignImage = this._campaignImage;
		copy.currentDay = this._currentDay;
		copy.campaignDays = this._campaignDays;
		copy.openedDays = [...this._openedDays];
		copy.missedDays = [...this._missedDays];
		return copy;
	}
}
