/**
 * Effect data model
 *
 * Based on AS3 com.sulake.habbo.inventory.effects.Effect (ENGINE only)
 */
export class Effect
{
	private _type: number = 0;
	private _subType: number = 0;
	private _duration: number = 0;
	private _secondsLeft: number = 0;
	private _amountInInventory: number = 1;
	private _isPermanent: boolean = false;
	private _isActive: boolean = false;
	private _isInUse: boolean = false;
	private _isSelected: boolean = false;
	private _activationTimestamp: number = 0;

	constructor()
	{
	}

	// ========== Getters ==========

	get type(): number
	{
		return this._type;
	}

	get subType(): number
	{
		return this._subType;
	}

	get duration(): number
	{
		return this._duration;
	}

	get amountInInventory(): number
	{
		return this._amountInInventory;
	}

	get isPermanent(): boolean
	{
		return this._isPermanent;
	}

	get isActive(): boolean
	{
		return this._isActive;
	}

	get isInUse(): boolean
	{
		return this._isInUse;
	}

	get isSelected(): boolean
	{
		return this._isSelected;
	}

	/**
	 * Get seconds remaining
	 * Calculates based on activation time if active
	 */
	get secondsLeft(): number
	{
		if (this._isActive)
		{
			const elapsed = (Date.now() - this._activationTimestamp) / 1000;
			const remaining = this._secondsLeft - elapsed;

			return Math.max(0, Math.floor(remaining));
		}

		return this._secondsLeft;
	}

	// ========== Setters ==========

	set type(value: number)
	{
		this._type = value;
	}

	set subType(value: number)
	{
		this._subType = value;
	}

	set duration(value: number)
	{
		this._duration = value;
	}

	set secondsLeft(value: number)
	{
		this._secondsLeft = value;
	}

	set amountInInventory(value: number)
	{
		this._amountInInventory = value;
	}

	set isPermanent(value: boolean)
	{
		this._isPermanent = value;
	}

	set isActive(value: boolean)
	{
		if (value && !this._isActive)
		{
			this._activationTimestamp = Date.now();
		}

		this._isActive = value;
	}

	set isInUse(value: boolean)
	{
		this._isInUse = value;
	}

	set isSelected(value: boolean)
	{
		this._isSelected = value;
	}

	// ========== Methods ==========

	/**
	 * Called when one effect instance expires
	 */
	setOneEffectExpired(): void
	{
		this._amountInInventory--;

		if (this._amountInInventory < 0)
		{
			this._amountInInventory = 0;
		}

		// Reset to full duration
		this._secondsLeft = this._duration;
		this._isActive = false;
		this._isInUse = false;
	}

	dispose(): void
	{
		// Nothing to clean up
	}
}
