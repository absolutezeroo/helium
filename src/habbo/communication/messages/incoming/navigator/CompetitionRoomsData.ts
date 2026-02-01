import type {IMessageDataWrapper} from '@core/communication';

/**
 * Competition rooms data
 *
 * Based on AS3 class_1665
 */
export class CompetitionRoomsData {
    private _goalId: number = 0;
    private _pageIndex: number = 0;
    private _pageCount: number = 0;

    constructor(wrapper: IMessageDataWrapper | null, goalId: number = 0, pageIndex: number = 0) {
        this._goalId = goalId;
        this._pageIndex = pageIndex;

        if (wrapper !== null) {
            this._goalId = wrapper.readInt();
            this._pageIndex = wrapper.readInt();
            this._pageCount = wrapper.readInt();
        }
    }

    get goalId(): number {
        return this._goalId;
    }

    get pageIndex(): number {
        return this._pageIndex;
    }

    get pageCount(): number {
        return this._pageCount;
    }
}
