/**
 * ItemAddMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.ItemAddMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ItemAddMessageParser} from '@habbo/communication/messages/parser/room/engine/ItemAddMessageParser';

export class ItemAddMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ItemAddMessageParser);
	}
}
