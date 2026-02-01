import type {IMessageComposer} from "@/core";

/**
 * Request bot inventory from server
 */
export class GetBotInventoryComposer implements IMessageComposer<ConstructorParameters<typeof GetBotInventoryComposer>>
{
	private _data: ConstructorParameters<typeof GetBotInventoryComposer>;

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
