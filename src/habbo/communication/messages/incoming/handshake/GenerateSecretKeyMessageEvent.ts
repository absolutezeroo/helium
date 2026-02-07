import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CompleteDiffieHandshakeMessageParser} from '../../parser/handshake/GenerateSecretKeyMessageParser';

/**
 * Event handler for CompleteDiffieHandshake message
 * Message ID: 3777
 *
 * @see source_as/habbo/communication/messages/incoming/handshake/CompleteDiffieHandshakeEvent.as
 */
export class CompleteDiffieHandshakeMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CompleteDiffieHandshakeMessageParser);
	}
}