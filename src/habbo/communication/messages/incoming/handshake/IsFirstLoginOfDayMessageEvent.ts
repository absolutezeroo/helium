import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IsFirstLoginOfDayMessageParser} from '../../parser/handshake/IsFirstLoginOfDayMessageParser';

/**
 * Event handler for IsFirstLoginOfDay message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/handshake/IsFirstLoginOfDayEvent.as
 */
export class IsFirstLoginOfDayMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, IsFirstLoginOfDayMessageParser);
	}
}
