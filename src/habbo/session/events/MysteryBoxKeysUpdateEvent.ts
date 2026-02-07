/**
 * Mystery box keys update event
 *
 * @see source_as/habbo/session/events/MysteryBoxKeysUpdateEvent.as
 */
export class MysteryBoxKeysUpdateEvent
{
	public static readonly MYSTERY_BOX_KEYS_UPDATE = 'mbke_update';

	private _boxColor: string;

	get boxColor(): string
	{
		return this._boxColor;
	}

	private _keyColor: string;

	get keyColor(): string
	{
		return this._keyColor;
	}

	constructor(boxColor: string, keyColor: string)
	{
		this._boxColor = boxColor;
		this._keyColor = keyColor;
	}
}
