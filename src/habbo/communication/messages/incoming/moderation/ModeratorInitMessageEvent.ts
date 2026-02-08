import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ModeratorInitMessageParser} from '../../parser/moderation/ModeratorInitMessageParser';

/**
 * Event for moderator initialization data.
 * Contains issues, templates, and permissions.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/ModeratorInitMessageEvent.as
 */
export class ModeratorInitMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ModeratorInitMessageParser);
	}
}
