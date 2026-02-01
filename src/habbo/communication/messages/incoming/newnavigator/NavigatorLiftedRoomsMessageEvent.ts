import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorLiftedRoomsMessageParser} from '../../parser/newnavigator';

/**
 * Event for lifted rooms
 *
 * @see source_as/habbo/communication/messages/incoming/newnavigator/NavigatorLiftedRoomsMessageEvent.as
 */
export class NavigatorLiftedRoomsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NavigatorLiftedRoomsMessageParser);
	}
}
