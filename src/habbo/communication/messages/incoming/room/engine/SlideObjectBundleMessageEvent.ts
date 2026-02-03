/**
 * SlideObjectBundleMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.SlideObjectBundleMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {SlideObjectBundleMessageParser} from '../../../parser/room/engine/SlideObjectBundleMessageParser';

export class SlideObjectBundleMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, SlideObjectBundleMessageParser);
	}
}
