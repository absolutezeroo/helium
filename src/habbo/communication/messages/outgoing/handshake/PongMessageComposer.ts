import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Response to server ping (keep-alive)
 *
 * @see source_as/habbo/communication/messages/outgoing/handshake/PongMessageComposer.as
 */
export class PongMessageComposer extends MessageComposer<ConstructorParameters<typeof PongMessageComposer>>
{
	private _data: ConstructorParameters<typeof PongMessageComposer>;

	constructor()
	{
		super();

		this._data = [];
	}

	getMessageArray()
	{
		return this._data;
	}

}
