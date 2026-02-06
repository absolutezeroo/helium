/**
 * FloorHeightMapMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.FloorHeightMapMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FloorHeightMapMessageParser} from '@habbo/communication/messages/parser/room/engine/FloorHeightMapMessageParser';

export class FloorHeightMapMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FloorHeightMapMessageParser);
	}
}
