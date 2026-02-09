import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ConvertedRoomIdMessageParser} from '../../parser/navigator/ConvertedRoomIdMessageParser';

/**
 * Event handler for ConvertedRoomId message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/ConvertedRoomIdEvent.as
 */
export class ConvertedRoomIdMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ConvertedRoomIdMessageParser);
	}
}
