import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomEventCancelMessageParser} from '../../parser/navigator/RoomEventCancelMessageParser';

export class RoomEventCancelMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, RoomEventCancelMessageParser);
    }
}
