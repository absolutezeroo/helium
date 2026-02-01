import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CompetitionRoomsDataMessageParser} from '../../parser/navigator/CompetitionRoomsDataMessageParser';

export class CompetitionRoomsDataMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CompetitionRoomsDataMessageParser);
	}
}
