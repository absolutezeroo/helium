import type {HabboToolbar} from '../../HabboToolbar';
import {CurrencyIndicatorBase} from './CurrencyIndicatorBase';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('PurseClubArea');

/**
 * Club membership area display in the purse extension
 *
 * In AS3 this extends CurrencyIndicatorBase to show club days remaining,
 * club icon (HC/VIP), and handles club status changes with animation.
 * In Helium, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/purse/PurseClubArea.as
 */
export class PurseClubArea extends CurrencyIndicatorBase
{
	private static readonly BG_COLOR_LIGHT: number = 0xFF57504D;
	private static readonly BG_COLOR_DARK: number = 0xFF3D3A4E;
	private static readonly ICON_STYLE_CLUB: number = 13;
	private static readonly ICON_STYLE_VIP: number = 14;
	private static readonly ICON_ANIMATION: string[] = [
		'toolbar_hc_icon_0',
		'toolbar_hc_icon_1',
		'toolbar_hc_icon_2',
		'toolbar_hc_icon_1',
		'toolbar_hc_icon_0',
	];

	private _previousDays: number = -1;
	private _toolbar: HabboToolbar | null;
	private _previousMinutes: number = 0;

	constructor(toolbar: HabboToolbar)
	{
		super();

		this._toolbar = toolbar;

		this.bgColorLight = PurseClubArea.BG_COLOR_LIGHT;
		this.bgColorDark = PurseClubArea.BG_COLOR_DARK;
		this.textElementName = 'days';
		this.iconAnimationSequence = PurseClubArea.ICON_ANIMATION;
		this.iconAnimationDelay = 50;
		this.amountZeroText = 'Get';

		log.debug('PurseClubArea constructed');
	}

	private _clubLevel: number = 0;

	/**
	 * Get the current club level
	 */
	get clubLevel(): number
	{
		return this._clubLevel;
	}

	private _clubIconStyle: number = PurseClubArea.ICON_STYLE_VIP;

	/**
	 * Get the current club icon style
	 */
	get clubIconStyle(): number
	{
		return this._clubIconStyle;
	}

	/**
	 * Handle club status change
	 *
	 * @param clubLevel The club level (0=none, 1=HC, 2=VIP)
	 * @param clubPeriods Number of club periods
	 * @param clubDays Number of additional club days
	 * @param clubMinutesUntilExpiration Minutes until expiration
	 */
	public onClubChanged(
		clubLevel: number,
		clubPeriods: number,
		clubDays: number,
		clubMinutesUntilExpiration: number
	): void
	{
		this._clubLevel = clubLevel;

		const totalDays = clubPeriods * 31 + clubDays;

		if (this._previousDays !== -1 && clubLevel !== 0)
		{
			this.setAmount(totalDays, clubMinutesUntilExpiration);
		}

		this._previousDays = totalDays;
		this._previousMinutes = clubMinutesUntilExpiration;

		switch (clubLevel)
		{
			case 0:
				this.setClubIcon(PurseClubArea.ICON_STYLE_VIP);
				this.setText(this.amountZeroText ?? 'Get');
				break;
			case 1:
				this.setClubIcon(PurseClubArea.ICON_STYLE_CLUB);
				break;
			case 2:
				this.setClubIcon(PurseClubArea.ICON_STYLE_VIP);
				break;
		}
	}

	/**
	 * Dispose of this club area
	 */
	public override dispose(): void
	{
		this._toolbar = null;
		super.dispose();
	}

	/**
	 * Override setAmount to show friendly time or "Get" for zero days
	 *
	 * @param amount Number of club days
	 * @param minutes Minutes until expiration
	 */
	protected override setAmount(amount: number, minutes: number = -1): void
	{
		if (amount < 1)
		{
			this.textElementName = 'join';
			this.setText(this.amountZeroText ?? 'Get');
		}
		else
		{
			this.textElementName = 'days';

			if (minutes !== -1 && minutes < 1440)
			{
				// Show hours/minutes for short durations
				const hours = Math.floor(minutes / 60);
				const mins = minutes % 60;

				if (hours > 0)
				{
					this.setText(`${hours}h ${mins}m`);
				}
				else
				{
					this.setText(`${mins}m`);
				}
			}
			else
			{
				// Show days for longer durations
				this.setText(`${amount}d`);
			}
		}
	}

	/**
	 * Set the club icon style
	 *
	 * @param style Icon style constant (13=HC, 14=VIP)
	 */
	private setClubIcon(style: number): void
	{
		this._clubIconStyle = style;
	}
}
