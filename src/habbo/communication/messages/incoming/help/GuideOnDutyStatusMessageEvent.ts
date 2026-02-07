import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuideOnDutyStatusMessageParser} from '../../parser/help/GuideOnDutyStatusMessageParser';

/**
 * Event for guide on-duty status updates.
 * Contains duty status and active guide/guardian counts.
 *
 * @see source_as/habbo/communication/messages/incoming/help/GuideOnDutyStatusMessageEvent.as
 */
export class GuideOnDutyStatusMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuideOnDutyStatusMessageParser);
	}
}
