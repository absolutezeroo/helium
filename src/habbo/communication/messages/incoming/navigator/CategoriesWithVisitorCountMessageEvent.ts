import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CategoriesWithVisitorCountMessageParser} from '../../parser/navigator/CategoriesWithVisitorCountMessageParser';

export class CategoriesWithVisitorCountMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, CategoriesWithVisitorCountMessageParser);
    }
}
