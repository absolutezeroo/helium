import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Activate an avatar effect
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/avatareffect/AvatarEffectActivatedComposer.as
 */
export class AvatarEffectActivatedComposer implements IMessageComposer<ConstructorParameters<typeof AvatarEffectActivatedComposer>>
{
	private _data: ConstructorParameters<typeof AvatarEffectActivatedComposer>;

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
