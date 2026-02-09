import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	AccountSafetyLockStatusChangeMessageEventParser
} from '../../parser/notifications/AccountSafetyLockStatusChangeMessageEventParser';

/**
 * Event for account safety lock status change
 *
 * @see source_as_win63/habbo/communication/messages/incoming/users/AccountSafetyLockStatusChangeMessageEvent.as
 */
export class AccountSafetyLockStatusChangeMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AccountSafetyLockStatusChangeMessageEventParser);
	}
}
