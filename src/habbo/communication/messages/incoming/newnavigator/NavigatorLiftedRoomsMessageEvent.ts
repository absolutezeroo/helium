import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorLiftedRoomsMessageParser} from '../../parser/newnavigator';

/**
 * Event for lifted rooms
 *
 * Based on AS3 class_348
 */
export class NavigatorLiftedRoomsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NavigatorLiftedRoomsMessageParser);
	}
}
