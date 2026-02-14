import type { ILimitedItemPreviewOverlayWidget } from './ILimitedItemPreviewOverlayWidget';
import type { IWidgetProperty } from './IWidget';

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

    private _disposed: boolean = false;
    private _serialNumber: number = 0;
    private _seriesSize: number = 0;

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

    public set seriesSize(value: number)
    {
        this._seriesSize = value;
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

