import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ActivityPointsMessageParser} from '../../parser/notifications/ActivityPointsMessageParser';

/**
 * Event handler for ActivityPoints message
 *
 * @see source_as/habbo/communication/messages/incoming/notifications/ActivityPointsMessageEvent.as
 */
export class ActivityPointsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ActivityPointsMessageParser);
	}
}
