import type {IMessageDataWrapper} from '@core/communication';

/**
 * Room category (flat category)
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1735
 */
export class FlatCategory {
    private _nodeId: number = 0;
    private _nodeName: string = '';
    private _visible: boolean = false;
    private _automatic: boolean = false;
    private _automaticCategoryKey: string = '';
    private _globalCategoryKey: string = '';
    private _staffOnly: boolean = false;

    constructor(wrapper: IMessageDataWrapper) {
        this._nodeId = wrapper.readInt();
        this._nodeName = wrapper.readString();
        this._visible = wrapper.readBoolean();
        this._automatic = wrapper.readBoolean();
        this._automaticCategoryKey = wrapper.readString();
        this._globalCategoryKey = wrapper.readString();
        this._staffOnly = wrapper.readBoolean();
    }

    get nodeId(): number {
        return this._nodeId;
    }

    get nodeName(): string {
        return this._nodeName;
    }

    get visible(): boolean {
        return this._visible;
    }

    get automatic(): boolean {
        return this._automatic;
    }

    get automaticCategoryKey(): string {
        return this._automaticCategoryKey;
    }

    get globalCategoryKey(): string {
        return this._globalCategoryKey;
    }

    get staffOnly(): boolean {
        return this._staffOnly;
    }

    get visibleName(): string {
        return this._globalCategoryKey === ''
            ? this._nodeName
            : '${navigator.flatcategory.global.' + this._globalCategoryKey + '}';
    }
}
