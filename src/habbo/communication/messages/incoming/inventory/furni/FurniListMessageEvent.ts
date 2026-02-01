import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FurniListMessageParser} from '../../../parser/inventory/furni/FurniListMessageParser';

export class FurniListMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurniListMessageParser);
	}
}
