import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideSessionDetachedMessageParser} from '../../parser/help/GuideSessionDetachedMessageParser';

/**
 * Event for guide session detachment notification.
 * Fired when the guide session is detached.
 *
 * @see source_as/habbo/communication/messages/incoming/help/GuideSessionDetachedMessageEvent.as
 */
export class GuideSessionDetachedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuideSessionDetachedMessageParser);
	}
}
