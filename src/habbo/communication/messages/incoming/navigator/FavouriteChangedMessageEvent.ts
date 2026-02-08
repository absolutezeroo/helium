import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FavouriteChangedMessageParser} from '../../parser/navigator/FavouriteChangedMessageParser';

/**
 * Event handler for FavouriteChanged message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/FavouriteChangedEvent.as
 */
export class FavouriteChangedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FavouriteChangedMessageParser);
	}
}
