import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {InitDiffieHandshakeMessageParser} from '../../parser/handshake/InitCryptoMessageParser';

/**
 * Event handler for InitDiffieHandshake message
 * Message ID: 771
 */
export class InitDiffieHandshakeMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, InitDiffieHandshakeMessageParser);
	}
}