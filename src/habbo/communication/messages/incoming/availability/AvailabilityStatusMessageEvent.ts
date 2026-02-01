import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AvailabilityStatusMessageParser} from '../../parser/availability/AvailabilityStatusMessageParser';

/**
 * Event handler for availability status message
 * Indicates if the hotel is open, shutting down, etc.
 */
export class AvailabilityStatusMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AvailabilityStatusMessageParser);
	}
}
