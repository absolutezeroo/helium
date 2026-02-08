import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	GuideSessionInvitedToGuideRoomMessageParser
} from '../../parser/help/GuideSessionInvitedToGuideRoomMessageParser';

/**
 * Event for being invited to a guide's room during a session.
 * Fired when the requester is invited to the guide's room.
 *
 * @see source_as/habbo/communication/messages/incoming/help/GuideSessionInvitedToGuideRoomMessageEvent.as
 */
export class GuideSessionInvitedToGuideRoomMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuideSessionInvitedToGuideRoomMessageParser);
	}
}
