import type {IMessageDataWrapper} from '@core/communication';
import {NavigatorSavedSearch} from './NavigatorSavedSearch';

/**
 * Top level context in the navigator (e.g., "official_view", "hotel_view")
 *
 * Based on AS3 class_1764
 */
export class NavigatorTopLevelContext {
    private _searchCode: string = '';
    private _savedSearches: NavigatorSavedSearch[] = [];

    constructor(wrapper: IMessageDataWrapper) {
        this._searchCode = wrapper.readString();
        const count = wrapper.readInt();
        for (let i = 0; i < count; i++) {
            this._savedSearches.push(new NavigatorSavedSearch(wrapper));
        }
    }

    get searchCode(): string {
        return this._searchCode;
    }

    get savedSearches(): NavigatorSavedSearch[] {
        return this._savedSearches;
    }
}
