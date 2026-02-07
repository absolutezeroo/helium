import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionEndedMessageParser} from '../../parser/help/GuideSessionEndedMessageParser';

/**
 * Event for guide session ended notification.
 * Fired when the guide session ends for any reason.
 *
 * @see source_as/habbo/communication/messages/incoming/help/GuideSessionEndedMessageEvent.as
 */
export class GuideSessionEndedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuideSessionEndedMessageParser);
	}
}
