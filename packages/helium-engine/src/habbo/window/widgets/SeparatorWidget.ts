import type {ISeparatorWidget} from './ISeparatorWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Visual separator widget.
 *
 * Renders a separator line (horizontal or vertical) using tiled
 * border images. Child windows punch holes through the separator line.
 *
 * In the AS3 version, uses BitmapData with tiled copyPixels and
 * fillRect for the punch-through effect. In the TypeScript port,
 * separator state is stored for CSS-based rendering by the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/SeparatorWidget.as
 */
export class SeparatorWidget implements ISeparatorWidget
{
	public static readonly TYPE: string = 'separator';

	private static readonly VERTICAL_KEY: string = 'separator:vertical';
	private static readonly BORDER_IMAGE_HORIZONTAL: string = 'illumina_light_separator_horizontal';
	private static readonly BORDER_IMAGE_VERTICAL: string = 'illumina_light_separator_vertical';

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

	private _vertical: boolean = false;

	public get vertical(): boolean
	{
		return this._vertical;
	}

	public set vertical(value: boolean)
	{
		this._vertical = value;
	}

	/**
	 * Get the border image asset name for the current orientation.
	 */
	public get borderImageName(): string
	{
		return this._vertical
			? SeparatorWidget.BORDER_IMAGE_VERTICAL
			: SeparatorWidget.BORDER_IMAGE_HORIZONTAL;
	}

	public get properties(): PropertyStruct[]
	{
		if(this._disposed) return [];

		return [
			new PropertyStruct(SeparatorWidget.VERTICAL_KEY, this._vertical),
		];
	}

	public set properties(values: PropertyStruct[])
	{
		for(const prop of values)
		{
			if(prop.key === SeparatorWidget.VERTICAL_KEY)
			{
				this.vertical = Boolean(prop.value);
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
