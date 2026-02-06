/**
 * RoomEntryTileMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.layout.RoomEntryTileMessageEvent
 *
 * Event fired when the room entry tile position is received.
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomEntryTileMessageParser} from '../../../parser/room/layout/RoomEntryTileMessageParser';

export class RoomEntryTileMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomEntryTileMessageParser);
	}
}
