import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AvatarEffectsMessageParser} from '../../parser/inventory/AvatarEffectsMessageParser';

export class AvatarEffectsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AvatarEffectsMessageParser);
	}
}
