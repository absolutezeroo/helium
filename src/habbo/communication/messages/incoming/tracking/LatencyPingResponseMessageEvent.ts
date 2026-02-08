import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {LatencyPingResponseMessageParser} from '../../parser/tracking/LatencyPingResponseMessageParser';

/**
 * Event for latency ping response from the server
 *
 * @see source_as_win63/habbo/communication/messages/incoming/tracking/LatencyPingResponseMessageEvent.as
 */
export class LatencyPingResponseMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, LatencyPingResponseMessageParser);
	}
}
