import type {IMessageComposer} from "@/core";

/**
 * Confirm accept trading (final confirmation)
 */
export class ConfirmAcceptTradingComposer implements IMessageComposer<ConstructorParameters<typeof ConfirmAcceptTradingComposer>>
{
	private _data: ConstructorParameters<typeof ConfirmAcceptTradingComposer>;

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
