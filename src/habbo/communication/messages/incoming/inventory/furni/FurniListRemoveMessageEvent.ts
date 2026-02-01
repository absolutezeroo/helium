import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FurniListRemoveMessageParser} from '../../../parser/inventory/furni/FurniListRemoveMessageParser';

export class FurniListRemoveMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurniListRemoveMessageParser);
	}
}
