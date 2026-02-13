import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {InterstitialMessageParser} from '../../parser/advertisement/InterstitialMessageParser';

/**
 * Event for interstitial ad availability response
 *
 * @see source_as_win63/habbo/communication/messages/incoming/advertisement/InterstitialMessageEvent.as
 */
export class InterstitialMessageEvent extends MessageEvent  implements IMessageEvent
{
	constructor(callback: Function)
	{
		super(callback, InterstitialMessageParser);
	}

	get parser(): InterstitialMessageParser
	{
		return this._parser as InterstitialMessageParser;
	}
}
