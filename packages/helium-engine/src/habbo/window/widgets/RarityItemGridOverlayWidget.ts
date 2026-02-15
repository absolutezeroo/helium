import type {IRarityItemGridOverlayWidget} from './IRarityItemGridOverlayWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Rarity item grid overlay widget.
 *
 * Displays a rarity level overlay on grid items, showing the
 * rarity number as a bitmap.
 *
 * @see sources/win63_version/habbo/window/widgets/RarityItemGridOverlayWidget.as
 */
export class RarityItemGridOverlayWidget implements IRarityItemGridOverlayWidget
{
	public static readonly TYPE: string = 'rarity_item_overlay_grid';

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;
	}

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _rarityLevel: number = 0;

	public get rarityLevel(): number
	{
		return this._rarityLevel;
	}

	public set rarityLevel(value: number)
	{
		this._rarityLevel = value;
	}

	public get properties(): PropertyStruct[]
	{
		return [];
	}

	public set properties(_values: PropertyStruct[])
	{
		// AS3: properties setter is a no-op for this widget
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._widgetWindow = null;
		this._windowManager = null;
		this._disposed = true;
	}
}
