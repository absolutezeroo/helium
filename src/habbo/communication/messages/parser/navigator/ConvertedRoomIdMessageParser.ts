import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for converted room id message
 *
 * Based on AS3 ConvertedRoomIdEventParser
 */
export class ConvertedRoomIdMessageParser implements IMessageParser {
    private _globalId: string = '';
    private _convertedId: number = 0;

    get globalId(): string {
        return this._globalId;
    }

    get convertedId(): number {
        return this._convertedId;
    }

    flush(): boolean {
        this._globalId = '';
        this._convertedId = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean {
        this._globalId = wrapper.readString();
        this._convertedId = wrapper.readInt();
        return true;
    }
}
