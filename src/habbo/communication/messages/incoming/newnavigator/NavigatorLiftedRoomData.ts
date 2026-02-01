import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data for a lifted room in the new navigator
 *
 * Based on AS3 class_1695
 */
export class NavigatorLiftedRoomData {
    private _flatId: number;
    private _areaId: number;
    private _image: string;
    private _caption: string;

    constructor(wrapper: IMessageDataWrapper) {
        this._flatId = wrapper.readInt();
        this._areaId = wrapper.readInt();
        this._image = wrapper.readString();
        this._caption = wrapper.readString();
    }

    get flatId(): number {
        return this._flatId;
    }

    get areaId(): number {
        return this._areaId;
    }

    get image(): string {
        return this._image;
    }

    get caption(): string {
        return this._caption;
    }
}
