/**
 * HeightMapMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.HeightMapMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HeightMapMessageParser} from '../../../parser/room/engine/HeightMapMessageParser';

export class HeightMapMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, HeightMapMessageParser);
	}
}
