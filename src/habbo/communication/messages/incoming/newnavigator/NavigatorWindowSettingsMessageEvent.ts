import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorWindowSettingsMessageParser} from '../../parser/newnavigator';

/**
 * Event for navigator window settings
 *
 * Based on AS3 class_364
 */
export class NavigatorWindowSettingsMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, NavigatorWindowSettingsMessageParser);
    }
}
