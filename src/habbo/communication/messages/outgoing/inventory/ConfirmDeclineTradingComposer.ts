import type {IMessageComposer} from "@/core";

/**
 * Decline trading after confirmation stage
 */
export class ConfirmDeclineTradingComposer implements IMessageComposer<ConstructorParameters<typeof ConfirmDeclineTradingComposer>>
{
	private _data: ConstructorParameters<typeof ConfirmDeclineTradingComposer>;

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
