import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {SanctionStatusMessageParser} from '../../parser/help/SanctionStatusMessageParser';

/**
 * Event for sanction status updates.
 * Provides information about the user's current sanction state.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/callforhelp/SanctionStatusEvent.as
 */
export class SanctionStatusMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, SanctionStatusMessageParser);
	}
}
