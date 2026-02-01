import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PopularRoomTagsResultMessageParser} from '../../parser/navigator/PopularRoomTagsResultMessageParser';

/**
 * Event handler for PopularRoomTagsResult message
 *
 * @see source_as/habbo/communication/messages/incoming/navigator/PopularRoomTagsResultEvent.as
 */
export class PopularRoomTagsResultMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PopularRoomTagsResultMessageParser);
	}
}
