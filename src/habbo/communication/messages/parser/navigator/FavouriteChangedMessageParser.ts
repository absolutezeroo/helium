import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for favourite changed message
 *
 * Based on AS3 FavouriteChangedEventParser
 */
export class FavouriteChangedMessageParser implements IMessageParser {
    private _flatId: number = 0;
    private _added: boolean = false;

    get flatId(): number {
        return this._flatId;
    }

    get added(): boolean {
        return this._added;
    }

    flush(): boolean {
        this._flatId = 0;
        this._added = false;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean {
        this._flatId = wrapper.readInt();
        this._added = wrapper.readBoolean();
        return true;
    }
}
