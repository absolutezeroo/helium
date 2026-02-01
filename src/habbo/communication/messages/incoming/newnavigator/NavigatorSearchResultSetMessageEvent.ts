import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorSearchResultSetMessageParser} from '../../parser/newnavigator';

/**
 * Event for a navigator search result set
 *
 */
export class NavigatorSearchResultSetMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NavigatorSearchResultSetMessageParser);
	}
}
