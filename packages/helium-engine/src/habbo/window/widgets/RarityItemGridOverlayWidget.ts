import type { IRarityItemGridOverlayWidget } from './IRarityItemGridOverlayWidget';
import type { IWidgetProperty } from './IWidget';

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

    private _disposed: boolean = false;
    private _rarityLevel: number = 0;

    constructor()
    {
    }

    public get rarityLevel(): number
    {
        return this._rarityLevel;
    }

    public set rarityLevel(value: number)
    {
        this._rarityLevel = value;
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

