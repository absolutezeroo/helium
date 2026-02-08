import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send SSO ticket for authentication
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/handshake/SSOTicketMessageComposer.as
 */
export class SSOTicketMessageComposer extends MessageComposer<ConstructorParameters<typeof SSOTicketMessageComposer>>
{
	private _data: ConstructorParameters<typeof SSOTicketMessageComposer>;

	constructor(ssoTicket: string, time: number = 0)
	{
		super();

		this._data = [ssoTicket, time];
	}

	getMessageArray()
	{
		return this._data;
	}

}
