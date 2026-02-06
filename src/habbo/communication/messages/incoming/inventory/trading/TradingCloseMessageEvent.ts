import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradingCloseMessageParser} from '@habbo/communication/messages/parser/inventory/trading/TradingCloseMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/inventory/trading/TradingCloseEvent.as
 */
export class TradingCloseMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingCloseMessageParser);
	}
}
