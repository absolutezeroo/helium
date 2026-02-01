import type {IMessageComposer} from "@/core";

/**
 * Select/use an avatar effect
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
