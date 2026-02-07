import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	TradingNotOpenMessageParser
} from '@habbo/communication/messages/parser/inventory/trading/TradingNotOpenMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/inventory/trading/TradingNotOpenEvent.as
 */
export class TradingNotOpenMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingNotOpenMessageParser);
	}
}
