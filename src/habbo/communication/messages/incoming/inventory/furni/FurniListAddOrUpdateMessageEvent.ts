import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FurniListAddOrUpdateMessageParser} from '../../../parser/inventory/furni/FurniListAddOrUpdateMessageParser';

export class FurniListAddOrUpdateMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurniListAddOrUpdateMessageParser);
	}
}
