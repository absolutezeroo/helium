import type {HabboToolbar} from '../HabboToolbar';
import type {PurseClubArea} from './purse/PurseClubArea';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('PurseAreaExtension');

/**
 * Manages the currency display area in the toolbar extension view
 *
 * In AS3 this creates a window from XML showing credits, duckets, and diamonds,
 * listens for purse balance events, and routes click events to catalog pages.
 * In Helium, the UI rendering is handled by SolidJS; this manages state.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/PurseAreaExtension.as
 */
export class PurseAreaExtension
{
	private static readonly MENU_HELP: string = 'HELP';

	private _toolbar: HabboToolbar | null;
	private _clubArea: PurseClubArea | null = null;

	constructor(toolbar: HabboToolbar)
	{
		this._toolbar = toolbar;

		log.debug('PurseAreaExtension constructed');
	}

	private _credits: number = 0;

	/**
	 * Get the current credits value
	 */
	get credits(): number
	{
		return this._credits;
	}

	private _duckets: number = 0;

	/**
	 * Get the current duckets value
	 */
	get duckets(): number
	{
		return this._duckets;
	}

	private _diamonds: number = 0;

	/**
	 * Get the current diamonds value
	 */
	get diamonds(): number
	{
		return this._diamonds;
	}

	/**
	 * Whether the extension is disposed
	 */
	get disposed(): boolean
	{
		return this._toolbar == null;
	}

	/**
	 * Get the club area sub-component
	 */
	public getClubArea(): PurseClubArea | null
	{
		return this._clubArea;
	}

	/**
	 * Set the club area sub-component
	 */
	public setClubArea(clubArea: PurseClubArea): void
	{
		this._clubArea = clubArea;
	}

	/**
	 * Update credits balance
	 *
	 * @param balance New credits balance
	 */
	public onCreditsBalance(balance: number): void
	{
		this._credits = balance;
	}

	/**
	 * Update activity point balance
	 *
	 * @param activityPointType The type of activity point (0=duckets, 5=diamonds)
	 * @param balance New balance
	 */
	public onPointBalance(activityPointType: number, balance: number): void
	{
		switch (activityPointType)
		{
			case 0:
				this._duckets = balance;
				break;
			case 5:
				this._diamonds = balance;
				break;
		}
	}

	/**
	 * Get the icon location for a named element
	 *
	 * @param name Element name
	 * @returns Rectangle or null
	 */
	public getIconLocation(name: string): { x: number; y: number; width: number; height: number } | null
	{
		// UI layer manages icon positions
		return null;
	}

	/**
	 * Dispose of this extension
	 */
	public dispose(): void
	{
		if (this.disposed) return;

		if (this._clubArea)
		{
			this._clubArea.dispose();
			this._clubArea = null;
		}

		this._toolbar = null;
	}
}
