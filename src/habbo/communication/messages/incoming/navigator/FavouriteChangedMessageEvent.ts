import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FavouriteChangedMessageParser} from '../../parser/navigator/FavouriteChangedMessageParser';

export class FavouriteChangedMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, FavouriteChangedMessageParser);
    }
}
