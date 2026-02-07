import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {InterstitialMessageParser} from '../../parser/advertisement/InterstitialMessageParser';

/**
 * Event for interstitial ad availability response
 *
 * @see source_as/habbo/communication/messages/incoming/advertisement/InterstitialMessageEvent.as
 */
export class InterstitialMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, InterstitialMessageParser);
	}
}
