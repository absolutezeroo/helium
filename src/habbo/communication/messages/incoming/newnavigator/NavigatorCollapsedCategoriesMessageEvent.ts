import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorCollapsedCategoriesMessageParser} from '../../parser/newnavigator';

/**
 * Event for collapsed categories
 *
 * @see source_as/habbo/communication/messages/incoming/newnavigator/NavigatorCollapsedCategoriesMessageEvent.as
 */
export class NavigatorCollapsedCategoriesMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NavigatorCollapsedCategoriesMessageParser);
	}
}
