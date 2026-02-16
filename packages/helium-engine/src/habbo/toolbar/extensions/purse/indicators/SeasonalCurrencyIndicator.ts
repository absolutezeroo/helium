import type {HabboToolbar} from '../../../HabboToolbar';
import {CurrencyIndicatorBase} from '../CurrencyIndicatorBase';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('SeasonalCurrencyIndicator');

/**
 * Seasonal currency indicator (diamonds, duckets, etc.)
 *
 * In AS3 this extends CurrencyIndicatorBase to display seasonal currency
 * balance, listens for activity point balance events, and opens the catalog
 * page on click. Handles custom colors from configuration.
 * In Helium, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/purse/indicators/SeasonalCurrencyIndicator.as
 */
export class SeasonalCurrencyIndicator extends CurrencyIndicatorBase
{
	private static readonly BG_COLOR_LIGHT: number = 0xFF57504D;
	private static readonly BG_COLOR_DARK: number = 0xFF3D3A4E;

	private _toolbar: HabboToolbar | null;
	private _previousBalance: number = -1;

	constructor(toolbar: HabboToolbar)
	{
		super();

		this._toolbar = toolbar;

		this.bgColorLight = SeasonalCurrencyIndicator.BG_COLOR_LIGHT;
		this.bgColorDark = SeasonalCurrencyIndicator.BG_COLOR_DARK;
		this.textElementName = 'amount';
		this.amountZeroText = 'Info';

		this.setAmount(0);

		log.debug('SeasonalCurrencyIndicator constructed');
	}

	private _balance: number = 0;

	/**
	 * The current balance
	 */
	get balance(): number
	{
		return this._balance;
	}

	/**
	 * The displayed activity point type from configuration
	 */
	get displayedActivityPointType(): number
	{
		if (!this._toolbar) return 1;
		return this._toolbar.getInteger('seasonalcurrencyindicator.currency', 1);
	}

	/**
	 * The currency background color from configuration
	 */
	get currencyBackgroundColor(): number
	{
		if (!this._toolbar) return 0;

		const hexStr = this._toolbar.getProperty(`seasonalcurrency.preset.${this.currencyColor}.border`);
		return parseInt(hexStr.replace('#', ''), 16) || 0;
	}

	/**
	 * The currency text color from configuration
	 */
	get currencyTextColor(): number
	{
		if (!this._toolbar) return 0;

		const hexStr = this._toolbar.getProperty(`seasonalcurrency.preset.${this.currencyColor}.font`);
		return parseInt(hexStr.replace('#', ''), 16) || 0;
	}

	/**
	 * The seasonal currency ID from configuration
	 */
	private get seasonalCurrencyId(): string
	{
		if (!this._toolbar) return '';
		return this._toolbar.getProperty(`seasonalcurrency.id.${this.displayedActivityPointType}`);
	}

	/**
	 * The catalog page name to open on click
	 */
	private get catalogPageName(): string
	{
		if (!this._toolbar) return '';
		return this._toolbar.getProperty('seasonalcurrencyindicator.page');
	}

	/**
	 * The currency color key from configuration
	 */
	private get currencyColor(): string
	{
		if (!this._toolbar) return '';
		return this._toolbar.getProperty(`seasonalcurrency.${this.seasonalCurrencyId}.color`);
	}

	/**
	 * Handle activity point balance update
	 *
	 * @param activityPointType Type of activity point
	 * @param balance New balance
	 */
	public onBalance(activityPointType: number, balance: number): void
	{
		if (activityPointType === this.displayedActivityPointType)
		{
			this._balance = balance;
			this.setAmount(balance);

			if (this._previousBalance !== -1)
			{
				this.animateChange(this._previousBalance, balance);
			}

			this._previousBalance = balance;
		}
	}

	/**
	 * Register update events
	 *
	 * @param _dispatcher Event dispatcher
	 */
	public override registerUpdateEvents(_dispatcher: unknown): void
	{
		// In AS3: dispatcher.addEventListener("catalog_purse_activity_point_balance", onBalance)
		// In Helium, the store bridges events to this indicator
	}

	/**
	 * Dispose of this indicator
	 */
	public override dispose(): void
	{
		this._toolbar = null;
		super.dispose();
	}

	/**
	 * Override to handle container click - opens catalog page
	 */
	protected override onContainerClick(): void
	{
		// In AS3: _catalog.openCatalogPage(catalogPageName)
		log.debug(`SeasonalCurrencyIndicator: open catalog page ${this.catalogPageName}`);
	}

	/**
	 * Override setAmount to show zero text when balance is 0
	 *
	 * @param amount The amount to display
	 * @param _minutes Unused
	 */
	protected override setAmount(amount: number, _minutes: number = -1): void
	{
		if (amount === 0)
		{
			const zeroText = this.amountZeroText ?? 'Info';
			this.setTextUnderline(true);
			this.setText(zeroText);
		}
		else
		{
			this.setTextUnderline(false);
			this.setText(amount.toString());
		}
	}
}
