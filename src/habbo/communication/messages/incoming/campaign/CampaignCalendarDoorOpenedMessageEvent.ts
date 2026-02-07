import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CampaignCalendarDoorOpenedMessageParser} from '../../parser/campaign/CampaignCalendarDoorOpenedMessageParser';

/**
 * Event for campaign calendar door opened response from server
 *
 * @see source_as/habbo/communication/messages/incoming/campaign/CampaignCalendarDoorOpenedMessageEvent.as
 */
export class CampaignCalendarDoorOpenedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CampaignCalendarDoorOpenedMessageParser);
	}
}
