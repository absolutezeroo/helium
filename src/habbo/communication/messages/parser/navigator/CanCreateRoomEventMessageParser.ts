import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for can create room event message
 *
 * Based on AS3 CanCreateRoomEventEventParser
 */
export class CanCreateRoomEventMessageParser implements IMessageParser {
    private _canCreateEvent: boolean = false;
    private _errorCode: number = 0;

    get canCreateEvent(): boolean {
        return this._canCreateEvent;
    }

    get errorCode(): number {
        return this._errorCode;
    }

    flush(): boolean {
        this._canCreateEvent = false;
        this._errorCode = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean {
        this._canCreateEvent = wrapper.readBoolean();
        this._errorCode = wrapper.readInt();
        return true;
    }
}
