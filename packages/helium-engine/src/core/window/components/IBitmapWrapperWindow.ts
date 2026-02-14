import type { IWindow } from '../IWindow';

/**
 * Interface for bitmap wrapper windows.
 *
 * Wraps a bitmap image referenced by URL for display within
 * the window system.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IBitmapWrapperWindow.as
 */
export interface IBitmapWrapperWindow extends IWindow
{
    imageUrl: string;
}
