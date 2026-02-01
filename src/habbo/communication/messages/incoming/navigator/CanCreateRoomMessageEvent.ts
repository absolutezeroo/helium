import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CanCreateRoomMessageParser} from '../../parser/navigator/CanCreateRoomMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/navigator/CanCreateRoomEvent.as
 */
export class CanCreateRoomMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CanCreateRoomMessageParser);
	}
}
