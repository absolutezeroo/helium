import type { ILimitedItemSupplyLeftOverlayWidget } from './ILimitedItemSupplyLeftOverlayWidget';
import type { IWidgetProperty } from './IWidget';

/**
 * Limited supply left overlay widget.
 *
 * Displays the remaining supply count and total series size for
 * limited edition items in the catalog purchase view.
 *
 * @see sources/win63_version/habbo/window/widgets/LimitedItemSupplyLeftOverlayWidget.as
 */
export class LimitedItemSupplyLeftOverlayWidget implements ILimitedItemSupplyLeftOverlayWidget
{
    public static readonly TYPE: string = 'limited_item_overlay_supply';

    private _disposed: boolean = false;
    private _supplyLeft: number = 0;
    private _seriesSize: number = 0;

    constructor()
    {
    }

    public get supplyLeft(): number
    {
        return this._supplyLeft;
    }

    public set supplyLeft(value: number)
    {
        this._supplyLeft = value;
    }

    public get serialNumber(): number
    {
        // AS3: serialNumber always returns 0 for supply widget
        return 0;
    }

    public set serialNumber(_value: number)
    {
        // AS3: serialNumber setter is a no-op for supply widget
    }

    public get seriesSize(): number
    {
        return this._seriesSize;
    }

    public set seriesSize(value: number)
    {
        this._seriesSize = value;
    }

    /**
     * Whether the item is sold out (supply <= 0).
     */
    public get isSoldOut(): boolean
    {
        return this._supplyLeft <= 0;
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

