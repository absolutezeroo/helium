import type { IRoomPreviewerWidget } from './IRoomPreviewerWidget';
import type { IWidgetProperty } from './IWidget';

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

    private _disposed: boolean = false;
    private _scale: number = 64;
    private _offsetX: number = 0;
    private _offsetY: number = 0;
    private _zoom: number = 1;
    private _roomPreviewer: unknown = null;
    private _previewImageUrl: string = '';

    constructor()
    {
    }

    public get scale(): number
    {
        return this._scale;
    }

    public set scale(value: number)
    {
        this._scale = value;
    }

    public get offsetX(): number
    {
        return this._offsetX;
    }

    public set offsetX(value: number)
    {
        this._offsetX = value;
    }

    public get offsetY(): number
    {
        return this._offsetY;
    }

    public set offsetY(value: number)
    {
        this._offsetY = value;
    }

    public get zoom(): number
    {
        return this._zoom;
    }

    public set zoom(value: number)
    {
        this._zoom = value;
    }

    public get roomPreviewer(): unknown
    {
        return this._roomPreviewer;
    }

    public showPreview(imageUrl: string): void
    {
        this._previewImageUrl = imageUrl;
    }

    /**
     * The static preview image URL, if set via showPreview().
     */
    public get previewImageUrl(): string
    {
        return this._previewImageUrl;
    }

    public get properties(): IWidgetProperty[]
    {
        if(this._disposed) return [];

        return [
            { key: RoomPreviewerWidget.SCALE_KEY, value: this._scale, type: 'int' },
            { key: RoomPreviewerWidget.OFFSET_X_KEY, value: this._offsetX, type: 'int' },
            { key: RoomPreviewerWidget.OFFSET_Y_KEY, value: this._offsetY, type: 'int' },
            { key: RoomPreviewerWidget.ZOOM_KEY, value: this._zoom, type: 'int' },
        ];
    }

    public setProperties(values: IWidgetProperty[]): void
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

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._roomPreviewer = null;
        this._disposed = true;
    }
}

