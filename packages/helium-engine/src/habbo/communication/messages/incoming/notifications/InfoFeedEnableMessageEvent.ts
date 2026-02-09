import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {InfoFeedEnableMessageParser} from '../../parser/notifications/InfoFeedEnableMessageParser';

/**
 * Event handler for InfoFeedEnable message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/notifications/InfoFeedEnableMessageEvent.as
 */
export class InfoFeedEnableMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, InfoFeedEnableMessageParser);
	}
}
