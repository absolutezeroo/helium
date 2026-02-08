import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CallForHelpDisabledNotifyMessageParser} from '../../parser/help/CallForHelpDisabledNotifyMessageParser';

/**
 * Event notifying that call for help is currently disabled.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/help/CallForHelpDisabledNotifyMessageEvent.as
 */
export class CallForHelpDisabledNotifyMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CallForHelpDisabledNotifyMessageParser);
	}
}
