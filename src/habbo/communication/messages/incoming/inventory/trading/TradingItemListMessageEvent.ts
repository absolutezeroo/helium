import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradingItemListMessageParser} from '../../../parser/inventory/trading/TradingItemListMessageParser';

export class TradingItemListMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingItemListMessageParser);
	}
}
