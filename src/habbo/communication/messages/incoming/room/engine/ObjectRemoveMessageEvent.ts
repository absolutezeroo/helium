/**
 * ObjectRemoveMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.ObjectRemoveMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ObjectRemoveMessageParser} from '../../../parser/room/engine/ObjectRemoveMessageParser';

export class ObjectRemoveMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ObjectRemoveMessageParser);
	}
}
