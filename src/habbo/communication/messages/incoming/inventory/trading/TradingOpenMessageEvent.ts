import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradingOpenMessageParser} from '../../../parser/inventory/trading/TradingOpenMessageParser';

export class TradingOpenMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingOpenMessageParser);
	}
}
