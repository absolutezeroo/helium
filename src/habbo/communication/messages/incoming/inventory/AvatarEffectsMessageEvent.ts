import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AvatarEffectsMessageParser} from '../../parser/inventory/AvatarEffectsMessageParser';

/**
 * Event handler for AvatarEffects message
 *
 * @see source_as/habbo/communication/messages/incoming/inventory/avatareffect/AvatarEffectsMessageEvent.as
 */
export class AvatarEffectsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AvatarEffectsMessageParser);
	}
}
