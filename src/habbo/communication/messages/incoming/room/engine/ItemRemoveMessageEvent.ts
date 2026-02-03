/**
 * ItemRemoveMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.ItemRemoveMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ItemRemoveMessageParser} from '../../../parser/room/engine/ItemRemoveMessageParser';

export class ItemRemoveMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ItemRemoveMessageParser);
	}
}
