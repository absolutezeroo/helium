import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Quest message data - holds all fields for a single quest
 *
 * @see source_as/habbo/communication/messages/incoming/quest/class_1715.as
 */
export class QuestMessageData
{
	private _campaignCode: string = '';
	private _completedQuestsInCampaign: number = 0;
	private _questCountInCampaign: number = 0;
	private _activityPointType: number = 0;
	private _id: number = 0;
	private _accepted: boolean = false;
	private _type: string = '';
	private _imageVersion: string = '';
	private _rewardCurrencyAmount: number = 0;
	private _localizationCode: string = '';
	private _completedSteps: number = 0;
	private _totalSteps: number = 0;
	private _sortOrder: number = 0;
	private _catalogPageName: string = '';
	private _chainCode: string = '';
	private _easy: boolean = false;
	private _isSeasonal: boolean = false;
	private _secondsLeft: number = 0;
	private _receiveTime: Date;

	constructor(wrapper: IMessageDataWrapper)
	{
		this._receiveTime = new Date();

		this._campaignCode = wrapper.readString();
		this._completedQuestsInCampaign = wrapper.readInt();
		this._questCountInCampaign = wrapper.readInt();
		this._activityPointType = wrapper.readInt();
		this._id = wrapper.readInt();
		this._accepted = wrapper.readBoolean();
		this._type = wrapper.readString();
		this._imageVersion = wrapper.readString();
		this._rewardCurrencyAmount = wrapper.readInt();
		this._localizationCode = wrapper.readString();
		this._completedSteps = wrapper.readInt();
		this._totalSteps = wrapper.readInt();
		this._sortOrder = wrapper.readInt();
		this._catalogPageName = wrapper.readString();
		this._chainCode = wrapper.readString();
		this._easy = wrapper.readBoolean();
		this._isSeasonal = wrapper.readBoolean();

		if(this._isSeasonal)
		{
			this._secondsLeft = wrapper.readInt();
		}
	}

	static getCampaignLocalizationKeyForCode(code: string): string
	{
		return 'quests.' + code;
	}

	get campaignCode(): string
	{
		return this._campaignCode;
	}

	get completedQuestsInCampaign(): number
	{
		return this._completedQuestsInCampaign;
	}

	get questCountInCampaign(): number
	{
		return this._questCountInCampaign;
	}

	get activityPointType(): number
	{
		return this._activityPointType;
	}

	get id(): number
	{
		return this._id;
	}

	set id(value: number)
	{
		this._id = value;
	}

	get accepted(): boolean
	{
		return this._accepted;
	}

	set accepted(value: boolean)
	{
		this._accepted = value;
	}

	get type(): string
	{
		return this._type;
	}

	get imageVersion(): string
	{
		return this._imageVersion;
	}

	get rewardCurrencyAmount(): number
	{
		return this._rewardCurrencyAmount;
	}

	get localizationCode(): string
	{
		return this._localizationCode;
	}

	get completedSteps(): number
	{
		return this._completedSteps;
	}

	get totalSteps(): number
	{
		return this._totalSteps;
	}

	get isCompleted(): boolean
	{
		return this._completedSteps === this._totalSteps;
	}

	get sortOrder(): number
	{
		return this._sortOrder;
	}

	get catalogPageName(): string
	{
		return this._catalogPageName;
	}

	get chainCode(): string
	{
		return this._chainCode;
	}

	get easy(): boolean
	{
		return this._easy;
	}

	get isSeasonal(): boolean
	{
		return this._isSeasonal;
	}

	get secondsLeft(): number
	{
		if(this._secondsLeft <= 0) return 0;

		const now = new Date();
		const elapsed = (now.getTime() - this._receiveTime.getTime()) / 1000;

		return this._secondsLeft - elapsed;
	}

	get completedCampaign(): boolean
	{
		return this._id < 1;
	}

	get lastQuestInCampaign(): boolean
	{
		return this._completedQuestsInCampaign >= this._questCountInCampaign;
	}

	get receiveTime(): Date
	{
		return this._receiveTime;
	}

	get campaignChainCode(): string
	{
		if(this._isSeasonal)
		{
			return this._campaignCode + '.' + this._chainCode;
		}

		return this._campaignCode;
	}

	getCampaignLocalizationKey(): string
	{
		return QuestMessageData.getCampaignLocalizationKeyForCode(this._campaignCode);
	}

	getQuestLocalizationKey(): string
	{
		return this.getCampaignLocalizationKey() + '.' + this._localizationCode;
	}
}
