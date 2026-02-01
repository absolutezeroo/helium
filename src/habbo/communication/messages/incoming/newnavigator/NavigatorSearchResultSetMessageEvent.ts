import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorSearchResultSetMessageParser} from '../../parser/newnavigator';

/**
 * Event for navigator search result set
 *
 * Based on AS3 class_151
 */
export class NavigatorSearchResultSetMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, NavigatorSearchResultSetMessageParser);
    }
}
