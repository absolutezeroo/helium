import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionStartedMessageParser} from '../../parser/help/GuideSessionStartedMessageParser';

/**
 * Event for guide session started notification.
 * Fired when a new guide session has been established.
 *
 * @see source_as/habbo/communication/messages/incoming/help/GuideSessionStartedMessageEvent.as
 */
export class GuideSessionStartedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuideSessionStartedMessageParser);
	}
}
