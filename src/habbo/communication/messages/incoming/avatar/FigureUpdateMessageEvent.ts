import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FigureUpdateMessageParser} from '../../parser/avatar/FigureUpdateMessageParser';

/**
 * Event handler for figure update message
 * Sent when user's avatar appearance changes
 */
export class FigureUpdateMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FigureUpdateMessageParser);
	}
}
