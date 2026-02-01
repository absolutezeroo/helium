import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {TradingConfirmationMessageParser} from '../../../parser/inventory/trading/TradingConfirmationMessageParser';

export class TradingConfirmationMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingConfirmationMessageParser);
	}
}
