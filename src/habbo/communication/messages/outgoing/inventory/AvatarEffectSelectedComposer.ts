import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Select/use an avatar effect
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/avatareffect/AvatarEffectSelectedComposer.as
 */
export class AvatarEffectSelectedComposer implements IMessageComposer<ConstructorParameters<typeof AvatarEffectSelectedComposer>>
{
	private _data: ConstructorParameters<typeof AvatarEffectSelectedComposer>;

	constructor(effectType: number)
	{
		this._data = [effectType];
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
