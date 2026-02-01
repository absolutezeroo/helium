import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorSavedSearchesMessageParser} from '../../parser/newnavigator';

/**
 * Event for saved searches
 *
 * Based on AS3 class_713
 */
export class NavigatorSavedSearchesMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, NavigatorSavedSearchesMessageParser);
    }
}
