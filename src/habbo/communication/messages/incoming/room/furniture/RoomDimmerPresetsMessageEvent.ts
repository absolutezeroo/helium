/**
 * RoomDimmerPresetsMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.furniture.RoomDimmerPresetsMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	RoomDimmerPresetsMessageEventParser
} from '@habbo/communication/messages/parser/room/furniture/RoomDimmerPresetsMessageEventParser';

export class RoomDimmerPresetsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomDimmerPresetsMessageEventParser);
	}
}
