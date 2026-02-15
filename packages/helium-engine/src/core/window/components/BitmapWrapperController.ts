import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { IBitmapWrapperWindow } from './IBitmapWrapperWindow';
import { BitmapDataController } from './BitmapDataController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Controller for bitmap wrapper windows.
 *
 * Extends BitmapDataController with programmatic bitmap setting.
 * Used for dynamic bitmaps set by code (e.g. avatar rendering).
 *
 * In AS3, the `bitmap` setter disposed the old BitmapData if
 * `disposesBitmap` was true, called `fitSize()`, and invalidated.
 *
 * @see sources/win63_version/core/window/components/BitmapWrapperController.as
 * @see sources/flash_version/com/sulake/core/window/components/BitmapWrapperController.as
 */
export class BitmapWrapperController extends BitmapDataController implements IBitmapWrapperWindow
{
    private _disposesBitmap: boolean = false;

    constructor(
        name: string,
        type: number,
        style: number,
        param: number,
        context: IWindowContext,
        rect: { x: number; y: number; width: number; height: number },
        parent: IWindow | null = null,
        procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
        tags: string[] | null = null,
        properties: unknown[] | null = null,
        id: number = 0,
        dynamicStyle: string = ''
    )
    {
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);
    }

    /**
     * The programmatic bitmap for this window.
     *
     * In AS3: `BitmapWrapperController.bitmap` (BitmapData).
     * Disposes the old bitmap if `_disposesBitmap` is true.
     */
    public get bitmap(): ImageBitmap | null
    {
        return this._bitmapData;
    }

    public set bitmap(value: ImageBitmap | null)
    {
        if(this._disposesBitmap && this._bitmapData && this._bitmapData !== value)
        {
            this._bitmapData.close();
        }

        this._bitmapData = value;

        this.fitSize();
        this._context.invalidate(this, null, 1);
    }

    /**
     * Whether this window owns the bitmap and should dispose it.
     *
     * In AS3: `disposesBitmap` — read from theme property `"handle_bitmap_disposing"`.
     */
    public get disposesBitmap(): boolean
    {
        return this._disposesBitmap;
    }

    public set disposesBitmap(value: boolean)
    {
        this._disposesBitmap = value;
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        if(this._disposesBitmap && this._bitmapData)
        {
            this._bitmapData.close();
            this._bitmapData = null;
        }

        super.dispose();
    }
}
