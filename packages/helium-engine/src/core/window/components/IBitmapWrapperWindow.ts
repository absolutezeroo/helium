import type {Texture} from 'pixi.js';
import type {IWindow} from '../IWindow';

/**
 * Interface for bitmap wrapper windows.
 *
 * Wraps a bitmap image referenced by URL or programmatic Texture
 * for display within the window system.
 *
 * In AS3 this had a `bitmap: BitmapData` property for programmatic
 * images and asset URIs for static images. In TS, we support both
 * `imageUrl` (static asset) and `texture` (programmatic PixiJS Texture).
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IBitmapWrapperWindow.as
 */
export interface IBitmapWrapperWindow extends IWindow
{
    imageUrl: string;

    /**
     * Programmatic texture set by code (e.g. avatar rendering).
     *
     * Equivalent to AS3's `IBitmapWrapperWindow.bitmap` (BitmapData).
     * When set, this takes priority over imageUrl for rendering.
     */
    texture: Texture | null;

    /**
     * The decoded bitmap content for this window.
     *
     * Equivalent to AS3's `BitmapDataController._bitmapData`.
     * When set, this image is drawn during compositing.
     * Takes priority over texture for canvas-based rendering.
     */
    bitmap: ImageBitmap | null;

    /**
     * Whether this window owns the texture and should dispose it.
     *
     * In AS3: `disposesBitmap`
     */
    disposesBitmap: boolean;
}
