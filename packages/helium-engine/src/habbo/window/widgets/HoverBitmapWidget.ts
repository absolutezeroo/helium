import type {IWidget} from './IWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Hover bitmap effect widget.
 *
 * Displays a bitmap that switches between a normal and hover asset
 * based on mouse interaction state.
 *
 * In the AS3 version, uses IStaticBitmapWrapperWindow and mouse events.
 * In the TypeScript port, asset URIs and hover state are stored for
 * the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/HoverBitmapWidget.as
 */
export class HoverBitmapWidget implements IWidget
{
	public static readonly TYPE: string = 'hover_bitmap';

	private static readonly HOVER_ASSET_KEY: string = 'hover_bitmap:hover_asset';
	private static readonly NORMAL_ASSET_KEY: string = 'hover_bitmap:normal_asset';

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

	private _normalAsset: string = '';

	public get normalAsset(): string
	{
		return this._normalAsset;
	}

	public set normalAsset(value: string)
	{
		this._normalAsset = value;
	}

	private _hoverAsset: string = '';

	public get hoverAsset(): string
	{
		return this._hoverAsset;
	}

	public set hoverAsset(value: string)
	{
		this._hoverAsset = value;
	}

	private _isHovering: boolean = false;

	/**
	 * Whether the widget is currently in hover state.
	 */
	public get isHovering(): boolean
	{
		return this._isHovering;
	}

	public set isHovering(value: boolean)
	{
		this._isHovering = value;
	}

	/**
	 * The current asset URI based on hover state.
	 */
	public get currentAsset(): string
	{
		return this._isHovering ? this._hoverAsset : this._normalAsset;
	}

	public get properties(): PropertyStruct[]
	{
		if(this._disposed) return [];

		return [
			new PropertyStruct(HoverBitmapWidget.NORMAL_ASSET_KEY, this._normalAsset),
			new PropertyStruct(HoverBitmapWidget.HOVER_ASSET_KEY, this._hoverAsset),
		];
	}

	public set properties(values: PropertyStruct[])
	{
		for(const prop of values)
		{
			switch(prop.key)
			{
				case HoverBitmapWidget.NORMAL_ASSET_KEY:
					this.normalAsset = String(prop.value);
					break;
				case HoverBitmapWidget.HOVER_ASSET_KEY:
					this.hoverAsset = String(prop.value);
					break;
			}
		}
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._widgetWindow = null;
		this._windowManager = null;
		this._disposed = true;
	}
}
