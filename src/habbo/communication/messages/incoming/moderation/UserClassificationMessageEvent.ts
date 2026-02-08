import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserClassificationMessageParser} from '../../parser/moderation/UserClassificationMessageParser';

/**
 * Event for user classification data.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/userclassification/UserClassificationMessageEvent.as
 */
export class UserClassificationMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UserClassificationMessageParser);
	}
}
