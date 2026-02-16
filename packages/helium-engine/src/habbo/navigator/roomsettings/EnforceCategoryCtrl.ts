import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';

/**
 * Modal dialog to enforce room category and trade mode selection.
 *
 * @see sources/win63_version/habbo/navigator/roomsettings/EnforceCategoryCtrl.as
 */
export class EnforceCategoryCtrl
{
	private _navigator: IHabboTransitionalNavigator | null;
	private _window: IWindow | null = null;
	private _categorySelection: number = 0;
	private _tradeModeSelection: number = 0;
	private _availableCategories: unknown[] = [];

	constructor(navigator: IHabboTransitionalNavigator)
	{
		this._navigator = navigator;
	}

	/**
	 * Shows the enforce category dialog.
	 *
	 * @param flatId - Room ID
	 */
	show(flatId: number): void
	{
		if (!this._navigator) return;

		// Would create modal dialog and populate dropdowns
	}

	close(): void
	{
		if (this._window)
		{
			this._window.dispose();
			this._window = null;
		}
	}

	dispose(): void
	{
		this.close();
		this._navigator = null;
	}

	private windowProcedure = (event: WindowEvent, window: IWindow): void =>
	{
		// Handle save/cancel button clicks
	};
}
