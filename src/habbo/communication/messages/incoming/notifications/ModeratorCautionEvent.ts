import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ModeratorCautionEventParser} from '../../parser/notifications/ModeratorCautionEventParser';

/**
 * Event for moderator caution
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/ModeratorCautionEvent.as
 */
export class ModeratorCautionEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ModeratorCautionEventParser);
	}
}
