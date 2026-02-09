import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BonusRareInfoMessageParser} from '../../parser/catalog/BonusRareInfoMessageParser';

/**
 * Event for bonus rare info from the catalog.
 * @see source_nitro_renderer/.../incoming/catalog/BonusRareInfoMessageEvent.ts
 */
export class BonusRareInfoMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, BonusRareInfoMessageParser);
	}
}
