import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HabboBroadcastMessageEventParser} from '../../parser/notifications/HabboBroadcastMessageEventParser';

/**
 * Event for Habbo broadcast message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/notifications/HabboBroadcastMessageEvent.as
 */
export class HabboBroadcastMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, HabboBroadcastMessageEventParser);
	}
}
