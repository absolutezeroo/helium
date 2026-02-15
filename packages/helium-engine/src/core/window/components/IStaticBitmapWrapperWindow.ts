import type { IWindow } from '../IWindow';

/**
 * Interface for static bitmap wrapper windows.
 *
 * Similar to IBitmapWrapperWindow but for static (non-interactive)
 * bitmap displays.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IStaticBitmapWrapperWindow.as
 */
export interface IStaticBitmapWrapperWindow extends IWindow
{
    imageUrl: string;

    /**
     * The decoded bitmap content for this window.
     *
     * Equivalent to AS3's `BitmapDataController._bitmapData`.
     * When set, this image is drawn during compositing.
     */
    bitmap: ImageBitmap | null;
}
