import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomInviteErrorMessageParser} from '../../parser/friendlist/RoomInviteErrorMessageParser';

/**
 * Event for receiving room invite errors.
 *
 * @see source_as/habbo/communication/messages/incoming/friendlist/RoomInviteErrorEvent.as
 */
export class RoomInviteErrorMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomInviteErrorMessageParser);
	}
}
