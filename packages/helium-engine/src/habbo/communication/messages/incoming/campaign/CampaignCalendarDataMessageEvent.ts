import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CampaignCalendarDataMessageParser} from '../../parser/campaign/CampaignCalendarDataMessageParser';

/**
 * Event for campaign calendar data received from server
 *
 * @see source_as_win63/habbo/communication/messages/incoming/campaign/CampaignCalendarDataMessageEvent.as
 */
export class CampaignCalendarDataMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CampaignCalendarDataMessageParser);
	}
}
