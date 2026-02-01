import type {IMessageDataWrapper} from '@core/communication';

/**
 * Saved search in the navigator
 *
 * Based on AS3 class_1706
 */
export class NavigatorSavedSearch {
    private _id: number = 0;
    private _searchCode: string = '';
    private _filter: string = '';
    private _localization: string = '';

    constructor(wrapper: IMessageDataWrapper) {
        this._id = wrapper.readInt();
        this._searchCode = wrapper.readString();
        this._filter = wrapper.readString();
        this._localization = wrapper.readString();
    }

    get id(): number {
        return this._id;
    }

    get searchCode(): string {
        return this._searchCode;
    }

    get filter(): string {
        return this._filter;
    }

    get localization(): string {
        return this._localization;
    }
}
