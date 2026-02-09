import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PromoArticlesMessageParser} from '../../parser/landingview/PromoArticlesMessageParser';

/**
 * Event for promo articles from the landing view.
 * @see source_nitro_renderer/.../incoming/landingview/PromoArticlesMessageEvent.ts
 */
export class PromoArticlesMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PromoArticlesMessageParser);
	}
}
