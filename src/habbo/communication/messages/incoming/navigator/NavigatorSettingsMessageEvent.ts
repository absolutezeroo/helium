import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NavigatorSettingsMessageParser} from '../../parser/navigator/NavigatorSettingsMessageParser';

export class NavigatorSettingsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NavigatorSettingsMessageParser);
	}
}
