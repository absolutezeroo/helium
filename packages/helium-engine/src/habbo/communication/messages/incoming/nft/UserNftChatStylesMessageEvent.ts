import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserNftChatStylesMessageParser} from '../../parser/nft/UserNftChatStylesMessageParser';

/**
 * Event for user NFT chat styles
 *
 * @see source_as_win63/habbo/communication/messages/incoming/nft/UserNftChatStylesMessageEvent.as
 */
export class UserNftChatStylesMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UserNftChatStylesMessageParser);
	}
}
