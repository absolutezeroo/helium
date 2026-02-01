import type {IMessageComposer} from "@/core";

/**
 * Request furniture inventory from server
 */
export class RequestFurniInventoryComposer implements IMessageComposer<ConstructorParameters<typeof RequestFurniInventoryComposer>>
{
	private _data: ConstructorParameters<typeof RequestFurniInventoryComposer>;

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
