import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradingCompletedMessageParser} from '../../../parser/inventory/trading/TradingCompletedMessageParser';

export class TradingCompletedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingCompletedMessageParser);
	}
}
