/**
 * OpenPetPackageRequestedMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.furniture.OpenPetPackageRequestedMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	OpenPetPackageRequestedMessageEventParser
} from '@habbo/communication/messages/parser/room/furniture/OpenPetPackageRequestedMessageEventParser';

export class OpenPetPackageRequestedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, OpenPetPackageRequestedMessageEventParser);
	}
}
