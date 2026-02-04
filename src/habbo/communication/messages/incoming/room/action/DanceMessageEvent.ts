/**
 * DanceMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.action.DanceMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {DanceMessageEventParser} from '../../../parser/room/action/DanceMessageEventParser';

export class DanceMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, DanceMessageEventParser);
	}
}
