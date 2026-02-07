import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionMessageMessageParser} from '../../parser/help/GuideSessionMessageMessageParser';

/**
 * Event for guide session chat messages.
 * Fired when a new message is received in a guide session.
 *
 * @see source_as/habbo/communication/messages/incoming/help/GuideSessionMessageMessageEvent.as
 */
export class GuideSessionMessageMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuideSessionMessageMessageParser);
	}
}
