import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomRatingMessageParser} from '../../parser/navigator/RoomRatingMessageParser';

export class RoomRatingMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, RoomRatingMessageParser);
    }
}
