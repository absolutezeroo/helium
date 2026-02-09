import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorSettingsMessageParser} from '../../parser/navigator/NavigatorSettingsMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/NavigatorSettingsEvent.as
 */
export class NavigatorSettingsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NavigatorSettingsMessageParser);
	}
}
