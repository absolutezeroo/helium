import type {IMessageDataWrapper} from '@core/communication';

/**
 * Event category
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1656
 */
export class EventCategory {
    private _categoryId: number = 0;
    private _categoryName: string = '';
    private _visible: boolean = false;

    constructor(wrapper: IMessageDataWrapper) {
        this._categoryId = wrapper.readInt();
        this._categoryName = wrapper.readString();
        this._visible = wrapper.readBoolean();
    }

    get categoryId(): number {
        return this._categoryId;
    }

    get categoryName(): string {
        return this._categoryName;
    }

    get visible(): boolean {
        return this._visible;
    }
}
