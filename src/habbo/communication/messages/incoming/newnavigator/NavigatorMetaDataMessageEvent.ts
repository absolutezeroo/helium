import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorMetaDataMessageParser} from '../../parser/newnavigator';

/**
 * Event for navigator metadata (top level contexts)
 *
 * @see source_as/habbo/communication/messages/incoming/newnavigator/NavigatorMetaDataMessageEvent.as
 */
export class NavigatorMetaDataMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NavigatorMetaDataMessageParser);
	}
}
