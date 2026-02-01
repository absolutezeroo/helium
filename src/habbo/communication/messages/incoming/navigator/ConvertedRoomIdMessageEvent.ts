import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ConvertedRoomIdMessageParser} from '../../parser/navigator/ConvertedRoomIdMessageParser';

export class ConvertedRoomIdMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, ConvertedRoomIdMessageParser);
    }
}
