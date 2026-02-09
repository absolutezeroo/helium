import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AccountPreferencesParser} from '../../parser/preferences/AccountPreferencesParser';

/**
 * Event for account preferences
 *
 * @see source_as_win63/habbo/communication/messages/incoming/preferences/AccountPreferencesEvent.as
 */
export class AccountPreferencesEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AccountPreferencesParser);
	}
}
