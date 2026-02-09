import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {DoorbellMessageParser} from '../../parser/navigator/DoorbellMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/DoorbellEvent.as
 */
export class DoorbellMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, DoorbellMessageParser);
	}
}
