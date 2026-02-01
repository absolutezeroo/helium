import type {IMessageComposer} from "@/core";

/**
 * Unaccept the current trade offer
 */
export class UnacceptTradingComposer implements IMessageComposer<ConstructorParameters<typeof UnacceptTradingComposer>>
{
	private _data: ConstructorParameters<typeof UnacceptTradingComposer>;

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
