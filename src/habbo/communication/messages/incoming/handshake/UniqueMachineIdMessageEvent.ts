import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UniqueMachineIdMessageParser} from '../../parser/handshake/UniqueMachineIdMessageParser';

/**
 * Event handler for Unique Machine ID message
 * Message ID: 3974
 */
export class UniqueMachineIdMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UniqueMachineIdMessageParser);
	}
}
