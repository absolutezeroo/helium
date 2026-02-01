import type {IMessageDataWrapper} from '@core/communication';
import type {INavigatorSearchResultData} from './INavigatorSearchResultData';
import {RoomTagData} from './RoomTagData';

/**
 * Popular room tags data
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1727
 */
export class PopularTagsData implements INavigatorSearchResultData {
    private _tags: RoomTagData[] = [];
    private _disposed: boolean = false;

    constructor(wrapper: IMessageDataWrapper) {
        const count = wrapper.readInt();
        for (let i = 0; i < count; i++) {
            this._tags.push(new RoomTagData(wrapper));
        }
    }

    get tags(): RoomTagData[] {
        return this._tags;
    }

    get disposed(): boolean {
        return this._disposed;
    }

    dispose(): void {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        this._tags = [];
    }
}
