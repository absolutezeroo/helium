import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('CurrencyIndicatorBase');

/**
 * Interface for currency indicator implementations
 *
 * Corresponds to the AS3 class_3491 interface.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/purse/class_3491.as
 */
export interface ICurrencyIndicator
{
	dispose(): void;
	registerUpdateEvents(dispatcher: unknown): void;
}

/**
 * Base class for currency display indicators in the toolbar
 *
 * In AS3 this manages a window with an icon, text, hover colors, and
 * animations for currency value changes. Sub-classes override setAmount(),
 * onContainerClick(), and registerUpdateEvents(). In Helium, rendering is
 * handled by SolidJS; this manages state and animation logic.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/purse/CurrencyIndicatorBase.as
 */
export class CurrencyIndicatorBase implements ICurrencyIndicator
{
	protected static readonly DIRECTION_FORWARD: number = 0;
	protected static readonly DIRECTION_REVERSE: number = 1;

	private static readonly OVERLAY_STEP: number = 0.025;

	private _disposed: boolean = false;
	private _bgColorLight: number = 0;
	private _bgColorDark: number = 0;
	private _textElementName: string = '';
	private _iconAnimationDelay: number = 0;
	private _amountZeroText: string | null = null;
	private _iconAnimationSequence: string[] = [];
	private _currentAmount: number = 0;
	private _currentText: string = '';
	private _animating: boolean = false;
	private _overlayPhase: number = 0;
	private _overlayStartValue: number = 0;
	private _overlayEndValue: number = 0;
	private _overlayTimer: ReturnType<typeof setInterval> | null = null;
	private _animTimer: ReturnType<typeof setInterval> | null = null;

	constructor()
	{
		log.debug('CurrencyIndicatorBase constructed');
	}

	/**
	 * Set the light background color for hover
	 */
	protected set bgColorLight(value: number)
	{
		this._bgColorLight = value;
	}

	protected get bgColorLightValue(): number
	{
		return this._bgColorLight;
	}

	/**
	 * Set the dark background color for normal state
	 */
	protected set bgColorDark(value: number)
	{
		this._bgColorDark = value;
	}

	protected get bgColorDarkValue(): number
	{
		return this._bgColorDark;
	}

	/**
	 * Set the text element name used for display
	 */
	protected set textElementName(value: string)
	{
		this._textElementName = value;
	}

	protected get textElementNameValue(): string
	{
		return this._textElementName;
	}

	/**
	 * Set the icon animation delay in ms
	 */
	protected set iconAnimationDelay(value: number)
	{
		this._iconAnimationDelay = value;
	}

	/**
	 * Set the text to display when amount is zero
	 */
	protected set amountZeroText(value: string | null)
	{
		this._amountZeroText = value;
	}

	protected get amountZeroText(): string | null
	{
		return this._amountZeroText;
	}

	/**
	 * Set the icon animation sequence
	 */
	protected set iconAnimationSequence(value: string[])
	{
		for(const frame of value)
		{
			this._iconAnimationSequence.push(frame);
		}
	}

	/**
	 * The current displayed text
	 */
	get currentText(): string
	{
		return this._currentText;
	}

	/**
	 * The current amount value
	 */
	get currentAmount(): number
	{
		return this._currentAmount;
	}

	/**
	 * Register update events on a dispatcher
	 *
	 * @param _dispatcher The event dispatcher to register on
	 */
	public registerUpdateEvents(_dispatcher: unknown): void
	{
		// Override in subclasses
	}

	/**
	 * Unregister update events from a dispatcher
	 *
	 * @param _dispatcher The event dispatcher to unregister from
	 */
	public unregisterUpdateEvents(_dispatcher: unknown): void
	{
		// Override in subclasses
	}

	/**
	 * Handle container click
	 */
	protected onContainerClick(): void
	{
		// Override in subclasses
	}

	/**
	 * Set the displayed amount
	 *
	 * @param amount The amount to display
	 * @param _minutes Optional minutes until expiration
	 */
	protected setAmount(amount: number, _minutes: number = -1): void
	{
		this._currentAmount = amount;
		this.setText(amount.toString());
	}

	/**
	 * Set the displayed text
	 *
	 * @param text The text to display
	 */
	protected setText(text: string): void
	{
		this._currentText = text;
	}

	/**
	 * Set text underline state
	 *
	 * @param _underline Whether to underline
	 */
	protected setTextUnderline(_underline: boolean): void
	{
		// UI layer handles text styling
	}

	/**
	 * Animate icon in a direction
	 *
	 * @param direction 0=forward, 1=reverse
	 */
	protected animateIcon(direction: number): void
	{
		if(this._iconAnimationSequence.length === 0) return;

		// In AS3, this cycles through icon animation frames
		// In Helium, we just track that an animation is occurring
		this._animating = true;

		if(this._animTimer !== null)
		{
			clearInterval(this._animTimer);
		}

		const frameCount = this._iconAnimationSequence.length;

		this._animTimer = setInterval(() =>
		{
			this._animating = false;

			if(this._animTimer !== null)
			{
				clearInterval(this._animTimer);
				this._animTimer = null;
			}
		}, this._iconAnimationDelay * frameCount);
	}

	/**
	 * Animate a value change with overlay effect
	 *
	 * @param startValue Starting value
	 * @param endValue Ending value
	 */
	protected animateChange(startValue: number, endValue: number): void
	{
		this._overlayPhase = 0;
		this._overlayStartValue = startValue;
		this._overlayEndValue = endValue;

		if(this._overlayTimer !== null)
		{
			clearInterval(this._overlayTimer);
		}

		this._overlayTimer = setInterval(() => this.onOverlayTimer(), 40);
		this.onOverlayTimer();
	}

	private onOverlayTimer(): void
	{
		const progress = Math.max(0, this._overlayPhase * 2 - 1);
		const interpolated = Math.round(
			this._overlayStartValue + (this._overlayEndValue - this._overlayStartValue) * progress
		);

		this.setAmount(interpolated);

		this._overlayPhase += CurrencyIndicatorBase.OVERLAY_STEP;

		if(this._overlayPhase >= 1)
		{
			if(this._overlayTimer !== null)
			{
				clearInterval(this._overlayTimer);
				this._overlayTimer = null;
			}

			this.setAmount(this._overlayEndValue);
		}
	}

	/**
	 * Dispose of this indicator and clean up resources
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		if(this._overlayTimer !== null)
		{
			clearInterval(this._overlayTimer);
			this._overlayTimer = null;
		}

		if(this._animTimer !== null)
		{
			clearInterval(this._animTimer);
			this._animTimer = null;
		}

		this._iconAnimationSequence = [];
		this._disposed = true;
	}
}
