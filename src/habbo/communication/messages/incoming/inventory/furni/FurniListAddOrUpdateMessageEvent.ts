import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FurniListAddOrUpdateMessageParser} from '../../../parser/inventory/furni/FurniListAddOrUpdateMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/inventory/furni/FurniListAddOrUpdateEvent.as
 */
export class FurniListAddOrUpdateMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurniListAddOrUpdateMessageParser);
	}
}
