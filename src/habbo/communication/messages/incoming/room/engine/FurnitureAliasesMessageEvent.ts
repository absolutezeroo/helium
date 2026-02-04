/**
 * FurnitureAliasesMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.FurnitureAliasesMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FurnitureAliasesMessageParser} from '../../../parser/room/engine/FurnitureAliasesMessageParser';

export class FurnitureAliasesMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurnitureAliasesMessageParser);
	}
}
