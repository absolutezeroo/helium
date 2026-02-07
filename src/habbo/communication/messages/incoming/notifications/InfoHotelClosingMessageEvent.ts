import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {InfoHotelClosingMessageEventParser} from '../../parser/notifications/InfoHotelClosingMessageEventParser';

/**
 * Event for hotel closing notification
 *
 * @see source_as/habbo/communication/messages/incoming/availability/InfoHotelClosingMessageEvent.as
 */
export class InfoHotelClosingMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, InfoHotelClosingMessageEventParser);
	}
}
