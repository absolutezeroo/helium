import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for room event cancel message
 *
 * Based on AS3 RoomEventCancelEventParser
 */
export class RoomEventCancelMessageParser implements IMessageParser {
    flush(): boolean {
        return true;
    }

    parse(_wrapper: IMessageDataWrapper): boolean {
        // No data to parse
        return true;
    }
}
