import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradingAcceptMessageParser} from '../../../parser/inventory/trading/TradingAcceptMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/inventory/trading/TradingAcceptEvent.as
 */
export class TradingAcceptMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingAcceptMessageParser);
	}
}
