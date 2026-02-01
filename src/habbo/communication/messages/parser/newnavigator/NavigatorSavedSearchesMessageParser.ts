import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NavigatorSavedSearch} from '../../incoming/newnavigator';

/**
 * Parser for saved searches message
 *
 * Based on AS3 class_1264
 */
export class NavigatorSavedSearchesMessageParser implements IMessageParser {
    private _savedSearches: NavigatorSavedSearch[] = [];

    get savedSearches(): NavigatorSavedSearch[] {
        return this._savedSearches;
    }

    flush(): boolean {
        this._savedSearches = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean {
        const count = wrapper.readInt();
        for (let i = 0; i < count; i++) {
            this._savedSearches.push(new NavigatorSavedSearch(wrapper));
        }
        return true;
    }
}
