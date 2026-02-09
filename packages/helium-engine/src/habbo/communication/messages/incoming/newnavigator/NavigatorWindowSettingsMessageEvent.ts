import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorWindowSettingsMessageParser} from '../../parser/newnavigator';

/**
 * Event for navigator window settings
 *
 * @see source_as_win63/habbo/communication/messages/incoming/newnavigator/NavigatorSettingsMessageEvent.as
 */
export class NavigatorWindowSettingsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NavigatorWindowSettingsMessageParser);
	}
}
