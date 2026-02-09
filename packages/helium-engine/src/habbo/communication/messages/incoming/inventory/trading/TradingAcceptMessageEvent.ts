import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	TradingAcceptMessageParser
} from '@habbo/communication/messages/parser/inventory/trading/TradingAcceptMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/trading/TradingAcceptEvent.as
 */
export class TradingAcceptMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingAcceptMessageParser);
	}
}
