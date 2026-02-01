import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradingCloseMessageParser} from '../../../parser/inventory/trading/TradingCloseMessageParser';

export class TradingCloseMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingCloseMessageParser);
	}
}
