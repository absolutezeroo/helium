import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorCollapsedCategoriesMessageParser} from '../../parser/newnavigator';

/**
 * Event for collapsed categories
 *
 * Based on AS3 class_954
 */
export class NavigatorCollapsedCategoriesMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NavigatorCollapsedCategoriesMessageParser);
	}
}
