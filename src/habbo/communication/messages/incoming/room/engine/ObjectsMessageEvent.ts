/**
 * ObjectsMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.ObjectsMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ObjectsMessageParser} from '@habbo/communication/messages/parser/room/engine/ObjectsMessageParser';

export class ObjectsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ObjectsMessageParser);
	}
}
