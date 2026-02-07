import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IdentityAccountsEventParser} from '../../parser/handshake/IdentityAccountsEventParser';

/**
 * Identity accounts event (multi-avatar selection)
 *
 * @see source_as/habbo/communication/messages/incoming/handshake/IdentityAccountsEvent.as
 */
export class IdentityAccountsEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, IdentityAccountsEventParser);
	}
}
