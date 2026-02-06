/**
 * ObjectDataUpdateMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.ObjectDataUpdateMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ObjectDataUpdateMessageParser} from '@habbo/communication/messages/parser/room/engine/ObjectDataUpdateMessageParser';

export class ObjectDataUpdateMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ObjectDataUpdateMessageParser);
	}
}
