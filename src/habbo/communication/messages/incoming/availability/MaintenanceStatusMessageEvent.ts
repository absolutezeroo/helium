import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MaintenanceStatusMessageEventParser} from '../../parser/availability/MaintenanceStatusMessageEventParser';

/**
 * Maintenance status message
 *
 * @see source_as/habbo/communication/messages/incoming/availability/MaintenanceStatusMessageEvent.as
 */
export class MaintenanceStatusMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, MaintenanceStatusMessageEventParser);
	}
}
