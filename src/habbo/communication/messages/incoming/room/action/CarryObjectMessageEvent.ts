/**
 * CarryObjectMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.action.CarryObjectMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CarryObjectMessageEventParser} from '../../../parser/room/action/CarryObjectMessageEventParser';

export class CarryObjectMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CarryObjectMessageEventParser);
	}
}
