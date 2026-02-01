import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Request furniture inventory from server
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/furni/RequestFurniInventoryComposer.as
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
