import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorSavedSearchesMessageParser} from '../../parser/newnavigator';

/**
 * Event for saved searches
 *
 * @see source_as_win63/habbo/communication/messages/incoming/newnavigator/NavigatorSavedSearchesMessageEvent.as
 */
export class NavigatorSavedSearchesMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NavigatorSavedSearchesMessageParser);
	}
}
