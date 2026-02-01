import type {IMessageComposer} from "@/core";

/**
 * Activate an avatar effect
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
