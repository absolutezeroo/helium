import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ModeratorMessageEventParser} from '../../parser/notifications/ModeratorMessageEventParser';

/**
 * Event for moderator message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/ModeratorMessageEvent.as
 */
export class ModeratorMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ModeratorMessageEventParser);
	}
}
