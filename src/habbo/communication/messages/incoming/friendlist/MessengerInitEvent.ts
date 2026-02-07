import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MessengerInitParser} from '../../parser/friendlist/MessengerInitParser';

/**
 * Event handler for messenger initialization.
 * Provides friend limits and category data.
 *
 * @see source_as/habbo/communication/messages/incoming/friendlist/MessengerInitEvent.as
 */
export class MessengerInitEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, MessengerInitParser);
	}
}
