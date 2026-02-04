/**
 * AvatarEffectMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.action.AvatarEffectMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AvatarEffectMessageEventParser} from '../../../parser/room/action/AvatarEffectMessageEventParser';

export class AvatarEffectMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AvatarEffectMessageEventParser);
	}
}
