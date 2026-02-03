/**
 * ObjectUpdateMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.ObjectUpdateMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ObjectUpdateMessageParser} from '../../../parser/room/engine/ObjectUpdateMessageParser';

export class ObjectUpdateMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ObjectUpdateMessageParser);
	}
}
