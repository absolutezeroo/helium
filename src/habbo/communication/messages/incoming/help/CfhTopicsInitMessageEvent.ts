import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CfhTopicsInitMessageParser} from '../../parser/help/CfhTopicsInitMessageParser';

/**
 * Event for CFH topics initialization.
 * Contains the full category/topic tree for the call for help system.
 *
 * @see source_as/habbo/communication/messages/incoming/callforhelp/CfhTopicsInitMessageEvent.as
 */
export class CfhTopicsInitMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CfhTopicsInitMessageParser);
	}
}
