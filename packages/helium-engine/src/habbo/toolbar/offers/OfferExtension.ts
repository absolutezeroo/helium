import type {HabboToolbar} from '../HabboToolbar';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('OfferExtension');

/**
 * Offer display extension for the toolbar
 *
 * In AS3 this implements IOfferExtension and IDisposable, creates a window
 * with a list of offer buttons (start video, check rewards), and communicates
 * with the catalog's offer center system. In Helium, UI rendering is handled
 * by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/offers/OfferExtension.as
 */
export class OfferExtension
{
	private _disposed: boolean = false;
	private _toolbar: HabboToolbar | null;
	private _visible: boolean = false;
	private _videoAvailable: boolean = false;
	private _rewardsAvailable: boolean = false;
	private _showingVideo: boolean = false;

	constructor(toolbar: HabboToolbar)
	{
		this._toolbar = toolbar;
		this._visible = false;

		log.debug('OfferExtension constructed');
	}

	/**
	 * Whether the extension is disposed
	 */
	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Whether the extension is visible
	 */
	get visible(): boolean
	{
		return this._visible;
	}

	/**
	 * Whether a video offer is available
	 */
	get videoAvailable(): boolean
	{
		return this._videoAvailable;
	}

	/**
	 * Whether rewards are available
	 */
	get rewardsAvailable(): boolean
	{
		return this._rewardsAvailable;
	}

	/**
	 * Handle a button click
	 *
	 * @param buttonName The button name
	 */
	public onButtonClick(buttonName: string): void
	{
		switch(buttonName)
		{
			case 'start_video':
				// In AS3: _offerCenter.showVideo()
				break;
			case 'check_rewards':
				// In AS3: _offerCenter.showRewards()
				break;
		}
	}

	/**
	 * Indicate that rewards are available to check
	 */
	public indicateRewards(): void
	{
		this._rewardsAvailable = true;
		this._visible = true;
		this.refresh();
	}

	/**
	 * Indicate whether a video is available to watch
	 *
	 * @param available Whether a video is available
	 */
	public indicateVideoAvailable(available: boolean): void
	{
		this._videoAvailable = available;

		if(available)
		{
			this._visible = true;
		}

		this.refresh();
	}

	private refresh(): void
	{
		this._visible = this._videoAvailable || this._rewardsAvailable;

		if(this._toolbar?.extensionView)
		{
			this._toolbar.extensionView.refreshItemWindow();
		}
	}

	/**
	 * Dispose of this extension
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		this._toolbar = null;
		this._disposed = true;
	}
}
