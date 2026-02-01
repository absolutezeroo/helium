import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradingAcceptMessageParser} from '../../../parser/inventory/trading/TradingAcceptMessageParser';

export class TradingAcceptMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingAcceptMessageParser);
	}
}
