import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Give respect to a pet
 *
 * @see source_as/habbo/communication/messages/outgoing/room/pets/RespectPetMessageComposer.as
 */
export class RespectPetMessageComposer extends MessageComposer<ConstructorParameters<typeof RespectPetMessageComposer>>
{
	private _data: ConstructorParameters<typeof RespectPetMessageComposer>;

	constructor(petId: number)
	{
		super();

		this._data = [petId];
	}

	public getMessageArray()
	{
		return this._data;
	}
}
