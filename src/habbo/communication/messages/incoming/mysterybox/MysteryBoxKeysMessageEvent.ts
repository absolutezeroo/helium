import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MysteryBoxKeysMessageParser} from '../../parser/mysterybox/MysteryBoxKeysMessageParser';

export class MysteryBoxKeysMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, MysteryBoxKeysMessageParser);
	}
}
