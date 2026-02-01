import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for room rating message
 *
 * Based on AS3 RoomRatingEventParser
 */
export class RoomRatingMessageParser implements IMessageParser {
    private _rating: number = 0;
    private _canRate: boolean = false;

    get rating(): number {
        return this._rating;
    }

    get canRate(): boolean {
        return this._canRate;
    }

    flush(): boolean {
        this._rating = 0;
        this._canRate = false;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean {
        this._rating = wrapper.readInt();
        this._canRate = wrapper.readBoolean();
        return true;
    }
}
