/**
 * YouAreControllerMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.permissions.YouAreControllerMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {YouAreControllerMessageParser} from '../../../parser/room/permissions/YouAreControllerMessageParser';

export class YouAreControllerMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, YouAreControllerMessageParser);
	}
}
