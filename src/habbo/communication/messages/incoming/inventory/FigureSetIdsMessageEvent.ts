import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FigureSetIdsMessageParser} from '../../parser/inventory/FigureSetIdsMessageParser';

export class FigureSetIdsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FigureSetIdsMessageParser);
	}
}
