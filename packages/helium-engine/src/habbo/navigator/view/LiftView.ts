import type {HabboNewNavigator} from '../HabboNewNavigator';

/**
 * Lift view for promoted/lifted rooms in the navigator.
 *
 * Stub implementation — lifted rooms are rarely used in modern clients.
 * Provides the structure for future implementation if needed.
 *
 * @see sources/win63_version/habbo/navigator/view/LiftView.as
 */
export class LiftView
{
	private _navigator: HabboNewNavigator;

	constructor(navigator: HabboNewNavigator)
	{
		this._navigator = navigator;
	}

	/**
	 * Refresh the lifted rooms display.
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as refresh()
	 */
	refresh(): void
	{
		// Stub — lifted rooms not implemented
	}

	/**
	 * Dispose the lift view.
	 *
	 * @see sources/win63_version/habbo/navigator/view/LiftView.as dispose()
	 */
	dispose(): void
	{
		// Stub
	}
}
