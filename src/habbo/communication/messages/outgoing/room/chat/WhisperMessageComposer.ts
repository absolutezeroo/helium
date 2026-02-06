import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send a whisper message to a specific user
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.chat.WhisperMessageComposer
 */
export class WhisperMessageComposer extends MessageComposer<[string, number, number]>
{
	private _data: [string, number, number];

	constructor(message: string, styleId: number, targetUserId: number)
	{
		super();
		this._data = [message, styleId, targetUserId];
	}

	public getMessageArray(): [string, number, number]
	{
		return this._data;
	}
}
