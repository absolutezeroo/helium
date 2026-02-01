import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BadgesMessageParser} from '../../../parser/inventory/badges/BadgesMessageParser';

export class BadgesMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, BadgesMessageParser);
	}
}
