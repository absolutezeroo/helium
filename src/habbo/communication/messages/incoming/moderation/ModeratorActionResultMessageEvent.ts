import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ModeratorActionResultMessageParser} from '../../parser/moderation/ModeratorActionResultMessageParser';

/**
 * Event for moderator action result (success/failure).
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/ModeratorActionResultMessageEvent.as
 */
export class ModeratorActionResultMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ModeratorActionResultMessageParser);
	}
}
