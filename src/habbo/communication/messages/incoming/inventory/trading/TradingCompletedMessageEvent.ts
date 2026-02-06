import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradingCompletedMessageParser} from '@habbo/communication/messages/parser/inventory/trading/TradingCompletedMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/inventory/trading/TradingCompletedEvent.as
 */
export class TradingCompletedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingCompletedMessageParser);
	}
}
