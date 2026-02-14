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
}
