/**
 * SleepMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.action.SleepMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {SleepMessageEventParser} from '../../../parser/room/action/SleepMessageEventParser';

export class SleepMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, SleepMessageEventParser);
	}
}
