import type { IMessageDataWrapper } from '@core/communication/messages/IMessageDataWrapper';

/**
 * Represents community goal progress data.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/quest/class_1678.as
 */
export class CommunityGoalProgressData
{
    private _hasGoalExpired: boolean;
    private _personalContributionScore: number;
    private _personalContributionRank: number;
    private _communityTotalScore: number;
    private _communityHighestAchievedLevel: number;
    private _scoreRemainingUntilNextLevel: number;
    private _percentCompletionTowardsNextLevel: number;
    private _goalCode: string;
    private _timeRemainingInSeconds: number;
    private _rewardUserLimits: Array<number>;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._hasGoalExpired = wrapper.readBoolean();
        this._personalContributionScore = wrapper.readInt();
        this._personalContributionRank = wrapper.readInt();
        this._communityTotalScore = wrapper.readInt();
        this._communityHighestAchievedLevel = wrapper.readInt();
        this._scoreRemainingUntilNextLevel = wrapper.readInt();
        this._percentCompletionTowardsNextLevel = wrapper.readInt();
        this._goalCode = wrapper.readString();
        this._timeRemainingInSeconds = wrapper.readInt();

        const count = wrapper.readInt();
        this._rewardUserLimits = [];
        for(let i = 0; i < count; i++)
        {
            this._rewardUserLimits.push(wrapper.readInt());
        }
    }

    get hasGoalExpired(): boolean
    {
        return this._hasGoalExpired;
    }

    get personalContributionScore(): number
    {
        return this._personalContributionScore;
    }

    get personalContributionRank(): number
    {
        return this._personalContributionRank;
    }

    get communityTotalScore(): number
    {
        return this._communityTotalScore;
    }

    get communityHighestAchievedLevel(): number
    {
        return this._communityHighestAchievedLevel;
    }

    get scoreRemainingUntilNextLevel(): number
    {
        return this._scoreRemainingUntilNextLevel;
    }

    get percentCompletionTowardsNextLevel(): number
    {
        return this._percentCompletionTowardsNextLevel;
    }

    get goalCode(): string
    {
        return this._goalCode;
    }

    get timeRemainingInSeconds(): number
    {
        return this._timeRemainingInSeconds;
    }

    get rewardUserLimits(): Array<number>
    {
        return this._rewardUserLimits;
    }
}
