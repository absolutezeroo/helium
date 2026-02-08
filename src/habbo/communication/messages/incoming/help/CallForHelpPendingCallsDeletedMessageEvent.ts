import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	CallForHelpPendingCallsDeletedMessageParser
} from '../../parser/help/CallForHelpPendingCallsDeletedMessageParser';

/**
 * Event indicating all pending calls for help have been deleted.
 *
 * @see source_as/habbo/communication/messages/incoming/help/CallForHelpPendingCallsDeletedMessageEvent.as
 */
export class CallForHelpPendingCallsDeletedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CallForHelpPendingCallsDeletedMessageParser);
	}
}
