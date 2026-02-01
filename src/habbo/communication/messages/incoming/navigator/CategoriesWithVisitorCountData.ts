import type {IMessageDataWrapper} from '@core/communication';
import type {INavigatorSearchResultData} from './INavigatorSearchResultData';

/**
 * Categories with visitor count data
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1751
 */
export class CategoriesWithVisitorCountData implements INavigatorSearchResultData {
    private _categoryToCurrentUserCountMap: Map<number, number> = new Map();
    private _categoryToMaxUserCountMap: Map<number, number> = new Map();
    private _disposed: boolean = false;

    constructor(wrapper: IMessageDataWrapper) {
        const count = wrapper.readInt();
        for (let i = 0; i < count; i++) {
            const categoryId = wrapper.readInt();
            const currentUserCount = wrapper.readInt();
            const maxUserCount = wrapper.readInt();

            this._categoryToCurrentUserCountMap.set(categoryId, currentUserCount);
            this._categoryToMaxUserCountMap.set(categoryId, maxUserCount);
        }
    }

    get categoryToCurrentUserCountMap(): Map<number, number> {
        return this._categoryToCurrentUserCountMap;
    }

    get categoryToMaxUserCountMap(): Map<number, number> {
        return this._categoryToMaxUserCountMap;
    }

    get disposed(): boolean {
        return this._disposed;
    }

    dispose(): void {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        this._categoryToCurrentUserCountMap.clear();
        this._categoryToMaxUserCountMap.clear();
    }
}
