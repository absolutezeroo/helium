import type {IMessageComposer} from "@/core";

/**
 * Accept the current trade offer
 */
export class AcceptTradingComposer implements IMessageComposer<ConstructorParameters<typeof AcceptTradingComposer>>
{
	private _data: ConstructorParameters<typeof AcceptTradingComposer>;

	constructor()
	{
		this._data = [];
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
