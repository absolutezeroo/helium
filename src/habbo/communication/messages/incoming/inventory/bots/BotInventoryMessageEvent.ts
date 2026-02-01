import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BotInventoryMessageParser} from '../../../parser/inventory/bots/BotInventoryMessageParser';

export class BotInventoryMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, BotInventoryMessageParser);
	}
}
