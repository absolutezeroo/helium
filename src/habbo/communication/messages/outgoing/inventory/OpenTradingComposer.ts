import type {IMessageComposer} from "@/core";

/**
 * Open trading with another user
 */
export class OpenTradingComposer implements IMessageComposer<ConstructorParameters<typeof OpenTradingComposer>>
{
	private _data: ConstructorParameters<typeof OpenTradingComposer>;

	constructor(userId: number)
	{
		this._data = [userId];
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
