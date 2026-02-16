import type {HabboToolbar} from './HabboToolbar';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('BottomBackgroundBorder');

/**
 * Background border rendering for the bottom toolbar area
 *
 * In AS3 this creates a window from XML, listens for parent resize events,
 * and repositions itself along the bottom of the desktop. In Helium, this is
 * a minimal stub since CSS handles the background rendering.
 *
 * @see sources/win63_version/habbo/toolbar/BottomBackgroundBorder.as
 */
export class BottomBackgroundBorder
{
	constructor(_toolbar: HabboToolbar)
	{
		log.debug('BottomBackgroundBorder constructed (stub)');
	}

	private _disposed: boolean = false;

	/**
	 * Whether this border is disposed
	 */
	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Dispose of this border
	 */
	public dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;
	}
}
