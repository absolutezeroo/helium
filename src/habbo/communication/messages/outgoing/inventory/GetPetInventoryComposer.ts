import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Request pet inventory from server
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/pets/GetPetInventoryComposer.as
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
