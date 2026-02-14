import type { ILimitedItemGridOverlayWidget } from './ILimitedItemGridOverlayWidget';
import type { IWidgetProperty } from './IWidget';

/**
 * Limited item grid overlay widget.
 *
 * Displays a limited edition overlay on grid items, showing the
 * serial number. Supports a shine animation effect that plays
 * periodically.
 *
 * In the AS3 version, implements IUpdateReceiver for the animation
 * loop and uses BitmapData for the shine effect. In the TypeScript
 * port, animation state is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/LimitedItemGridOverlayWidget.as
 */
export class LimitedItemGridOverlayWidget implements ILimitedItemGridOverlayWidget
{
    public static readonly TYPE: string = 'limited_item_overlay_grid';

    private readonly SHINE_INTERVAL_MS: number = 10000;
    private readonly SHINE_LENGTH_MS: number = 250;

    private _disposed: boolean = false;
    private _serialNumber: number = 0;
    private _seriesSize: number = 0;
    private _animated: boolean = false;

    constructor()
    {
    }

    public get serialNumber(): number
    {
        return this._serialNumber;
    }

    public set serialNumber(value: number)
    {
        this._serialNumber = value;
    }

    public get seriesSize(): number
    {
        return this._seriesSize;
    }

    public set seriesSize(_value: number)
    {
        // AS3: seriesSize setter is a no-op for grid overlay
    }

    public get animated(): boolean
    {
        return this._animated;
    }

    public set animated(value: boolean)
    {
        this._animated = value;
    }

    public get properties(): IWidgetProperty[]
    {
        return [];
    }

    public setProperties(_values: IWidgetProperty[]): void
    {
        // AS3: properties setter is a no-op for this widget
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
    }
}

