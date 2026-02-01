import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Send SSO ticket for authentication
 */
export class SSOTicketMessageComposer implements IMessageComposer<ConstructorParameters<typeof SSOTicketMessageComposer>>
{
	private _data: ConstructorParameters<typeof SSOTicketMessageComposer>;

	constructor(ssoTicket: string, time: number = 0)
	{
		this._data = [ssoTicket, time];
	}

	getMessageArray()
	{
		return this._data;
	}

	dispose(): void
	{
		return;
	}
}
