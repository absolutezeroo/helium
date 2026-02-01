import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomEventMessageParser} from '../../parser/navigator/RoomEventMessageParser';

export class RoomEventMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, RoomEventMessageParser);
    }
}
