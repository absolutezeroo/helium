import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradingItemListMessageParser} from '@habbo/communication/messages/parser/inventory/trading/TradingItemListMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/inventory/trading/TradingItemListEvent.as
 */
export class TradingItemListMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingItemListMessageParser);
	}
}
