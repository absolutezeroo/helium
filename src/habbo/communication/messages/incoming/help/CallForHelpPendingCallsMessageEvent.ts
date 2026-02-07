import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CallForHelpPendingCallsMessageParser} from '../../parser/help/CallForHelpPendingCallsMessageParser';

/**
 * Event for pending calls for help list.
 *
 * @see source_as/habbo/communication/messages/incoming/help/CallForHelpPendingCallsMessageEvent.as
 */
export class CallForHelpPendingCallsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CallForHelpPendingCallsMessageParser);
	}
}
