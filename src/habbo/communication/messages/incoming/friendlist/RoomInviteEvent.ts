import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomInviteEventParser} from '../../parser/friendlist/RoomInviteEventParser';

/**
 * Event handler for room invite events.
 * Fired when a friend sends a room invitation.
 *
 * @see source_as/habbo/communication/messages/incoming/friendlist/RoomInviteEvent.as
 */
export class RoomInviteEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomInviteEventParser);
	}
}
