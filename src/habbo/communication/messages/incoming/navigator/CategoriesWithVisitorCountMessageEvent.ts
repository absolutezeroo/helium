import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CategoriesWithVisitorCountMessageParser} from '../../parser/navigator/CategoriesWithVisitorCountMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/navigator/CategoriesWithVisitorCountEvent.as
 */
export class CategoriesWithVisitorCountMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CategoriesWithVisitorCountMessageParser);
	}
}
