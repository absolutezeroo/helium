import type {ILimitedItemPreviewOverlayWidget} from './ILimitedItemPreviewOverlayWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Limited item preview overlay widget.
 *
 * Displays serial number and series size for limited edition items
 * in the catalog/marketplace preview view.
 *
 * @see sources/win63_version/habbo/window/widgets/LimitedItemPreviewOverlayWidget.as
 */
export class LimitedItemPreviewOverlayWidget implements ILimitedItemPreviewOverlayWidget
{
	public static readonly TYPE: string = 'limited_item_overlay_preview';

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _serialNumber: number = 0;

	public get serialNumber(): number
	{
		return this._serialNumber;
	}

	public set serialNumber(value: number)
	{
		this._serialNumber = value;
	}

	private _seriesSize: number = 0;

	public get seriesSize(): number
	{
		return this._seriesSize;
	}

	public set seriesSize(value: number)
	{
		this._seriesSize = value;
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
