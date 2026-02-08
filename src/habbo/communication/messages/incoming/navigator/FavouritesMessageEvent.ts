import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FavouritesMessageParser} from '../../parser/navigator/FavouritesMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/FavouritesEvent.as
 */
export class FavouritesMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FavouritesMessageParser);
	}
}
