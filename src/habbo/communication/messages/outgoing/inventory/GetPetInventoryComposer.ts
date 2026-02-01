import type {IMessageComposer} from "@/core";

/**
 * Request pet inventory from server
 */
export class GetPetInventoryComposer implements IMessageComposer<ConstructorParameters<typeof GetPetInventoryComposer>>
{
	private _data: ConstructorParameters<typeof GetPetInventoryComposer>;

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
