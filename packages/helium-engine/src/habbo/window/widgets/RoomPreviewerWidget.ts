import type {IRoomPreviewerWidget} from './IRoomPreviewerWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Room previewer widget.
 *
 * Renders a 3D room preview with configurable scale, zoom, and offset.
 * Creates a RoomPreviewer instance for rendering furniture, avatars,
 * and pets in a mini room view.
 *
 * In the AS3 version, uses RoomPreviewer with DisplayObject canvas.
 * In the TypeScript port, preview configuration is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/RoomPreviewerWidget.as
 */
export class RoomPreviewerWidget implements IRoomPreviewerWidget
{
	public static readonly TYPE: string = 'room_previewer';

	private static readonly SCALE_KEY: string = 'room_previewer:scale';
	private static readonly OFFSET_X_KEY: string = 'room_previewer:offsetx';
	private static readonly OFFSET_Y_KEY: string = 'room_previewer:offsety';
	private static readonly ZOOM_KEY: string = 'room_previewer:zoom';

	private static _roomIdCounter: number = 2;

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

	private _scale: number = 64;

	public get scale(): number
	{
		return this._scale;
	}

	public set scale(value: number)
	{
		this._scale = value;
	}

	private _offsetX: number = 0;

	public get offsetX(): number
	{
		return this._offsetX;
	}

	public set offsetX(value: number)
	{
		this._offsetX = value;
	}

	private _offsetY: number = 0;

	public get offsetY(): number
	{
		return this._offsetY;
	}

	public set offsetY(value: number)
	{
		this._offsetY = value;
	}

	private _zoom: number = 1;

	public get zoom(): number
	{
		return this._zoom;
	}

	public set zoom(value: number)
	{
		this._zoom = value;
	}

	private _roomPreviewer: unknown = null;

	public get roomPreviewer(): unknown
	{
		return this._roomPreviewer;
	}

	private _previewImageUrl: string = '';

	/**
	 * The static preview image URL, if set via showPreview().
	 */
	public get previewImageUrl(): string
	{
		return this._previewImageUrl;
	}

	public get properties(): PropertyStruct[]
	{
		if(this._disposed) return [];

		return [
			new PropertyStruct(RoomPreviewerWidget.SCALE_KEY, this._scale),
			new PropertyStruct(RoomPreviewerWidget.OFFSET_X_KEY, this._offsetX),
			new PropertyStruct(RoomPreviewerWidget.OFFSET_Y_KEY, this._offsetY),
			new PropertyStruct(RoomPreviewerWidget.ZOOM_KEY, this._zoom),
		];
	}

	public showPreview(imageUrl: string): void
	{
		this._previewImageUrl = imageUrl;
	}

	public set properties(values: PropertyStruct[])
	{
		for(const prop of values)
		{
			switch(prop.key)
			{
				case RoomPreviewerWidget.SCALE_KEY:
					this.scale = Number(prop.value);
					break;
				case RoomPreviewerWidget.OFFSET_X_KEY:
					this.offsetX = Number(prop.value);
					break;
				case RoomPreviewerWidget.OFFSET_Y_KEY:
					this.offsetY = Number(prop.value);
					break;
				case RoomPreviewerWidget.ZOOM_KEY:
					this.zoom = Number(prop.value);
					break;
			}
		}
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._widgetWindow = null;
		this._windowManager = null;
		this._roomPreviewer = null;
		this._disposed = true;
	}
}
