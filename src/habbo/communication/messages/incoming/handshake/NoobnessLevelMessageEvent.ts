import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NoobnessLevelMessageParser} from '../../parser/handshake/NoobnessLevelMessageParser';

/**
 * Event handler for noobness level message
 * Indicates user's experience level (new user status)
 */
export class NoobnessLevelMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NoobnessLevelMessageParser);
	}
}
