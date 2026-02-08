import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FigureSetIdsMessageParser} from '../../parser/inventory/FigureSetIdsMessageParser';

/**
 * Event handler for FigureSetIds message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/clothing/FigureSetIdsEvent.as
 */
export class FigureSetIdsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FigureSetIdsMessageParser);
	}
}
