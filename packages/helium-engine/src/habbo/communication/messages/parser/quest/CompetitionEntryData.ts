import type { IMessageDataWrapper } from '@core/communication/messages/IMessageDataWrapper';

/**
 * Represents a competition entry with user ranking and reward information.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/quest/class_1760.as
 */
export class CompetitionEntryData
{
    private _communityGoalId: number;
    private _communityGoalCode: string;
    private _userRank: number;
    private _rewardCode: string;
    private _badge: boolean;
    private _localizedName: string;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._communityGoalId = wrapper.readInt();
        this._communityGoalCode = wrapper.readString();
        this._userRank = wrapper.readInt();
        this._rewardCode = wrapper.readString();
        this._badge = wrapper.readBoolean();
        this._localizedName = wrapper.readString();
    }

    get communityGoalId(): number
    {
        return this._communityGoalId;
    }

    get communityGoalCode(): string
    {
        return this._communityGoalCode;
    }

    get userRank(): number
    {
        return this._userRank;
    }

    get rewardCode(): string
    {
        return this._rewardCode;
    }

    get badge(): boolean
    {
        return this._badge;
    }

    get localizedName(): string
    {
        return this._localizedName;
    }
}
