/**
 * ObjectAddMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.ObjectAddMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ObjectAddMessageParser} from '../../../parser/room/engine/ObjectAddMessageParser';

export class ObjectAddMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ObjectAddMessageParser);
	}
}
