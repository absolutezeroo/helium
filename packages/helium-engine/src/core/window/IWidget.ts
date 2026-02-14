import type { IWindow } from './IWindow';

/**
 * Base widget interface.
 *
 * Widgets are reusable UI components that can be embedded in window containers.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/IWidget.as
 */
export interface IWidget
{
    readonly disposed: boolean;
    readonly window: IWindow | null;

    initialize(k: number, window: IWindow): void;
    dispose(): void;
}
