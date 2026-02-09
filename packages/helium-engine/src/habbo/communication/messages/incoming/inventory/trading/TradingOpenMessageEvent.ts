import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	TradingOpenMessageParser
} from '@habbo/communication/messages/parser/inventory/trading/TradingOpenMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/trading/TradingOpenEvent.as
 */
export class TradingOpenMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingOpenMessageParser);
	}
}
