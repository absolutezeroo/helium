import type {IMessageComposer} from "@/core";

/**
 * Close trading session
 */
export class CloseTradingComposer implements IMessageComposer<ConstructorParameters<typeof CloseTradingComposer>>
{
	private _data: ConstructorParameters<typeof CloseTradingComposer>;

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
