import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { IStaticBitmapWrapperWindow } from './IStaticBitmapWrapperWindow';
import { WindowController } from '../WindowController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Controller for static bitmap wrapper windows.
 *
 * Similar to BitmapWrapperController but for static (non-interactive)
 * bitmap displays that do not respond to mouse events.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/StaticBitmapWrapperController.as
 */
export class StaticBitmapWrapperController extends WindowController implements IStaticBitmapWrapperWindow
{
    private _imageUrl: string = '';
    private _bitmap: ImageBitmap | null = null;

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

    public get imageUrl(): string
    {
        return this._imageUrl;
    }

    public set imageUrl(value: string)
    {
        this._imageUrl = value ?? '';
    }

    /**
     * The decoded bitmap content for this window.
     *
     * Equivalent to AS3's `BitmapDataController._bitmapData`.
     * When set via `receiveAsset()` or programmatically, this is the
     * image that will be drawn during compositing.
     *
     * @see sources/win63_version/core/window/components/BitmapDataController.as
     */
    public get bitmap(): ImageBitmap | null
    {
        return this._bitmap;
    }

    public set bitmap(value: ImageBitmap | null)
    {
        this._bitmap = value;
    }
}
