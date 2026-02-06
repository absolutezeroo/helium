import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BotInventoryMessageParser} from '@habbo/communication/messages/parser/inventory/bots/BotInventoryMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/inventory/bots/BotInventoryEvent.as
 */
export class BotInventoryMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, BotInventoryMessageParser);
	}
}
