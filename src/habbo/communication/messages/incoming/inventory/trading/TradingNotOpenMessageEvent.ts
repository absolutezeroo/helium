import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradingNotOpenMessageParser} from '../../../parser/inventory/trading/TradingNotOpenMessageParser';

export class TradingNotOpenMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingNotOpenMessageParser);
	}
}
