import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for flat created message
 *
 * Based on AS3 FlatCreatedEventParser
 */
export class FlatCreatedMessageParser implements IMessageParser {
    private _flatId: number = 0;
    private _flatName: string = '';

    get flatId(): number {
        return this._flatId;
    }

    get flatName(): string {
        return this._flatName;
    }

    flush(): boolean {
        this._flatId = 0;
        this._flatName = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean {
        this._flatId = wrapper.readInt();
        this._flatName = wrapper.readString();
        return true;
    }
}
