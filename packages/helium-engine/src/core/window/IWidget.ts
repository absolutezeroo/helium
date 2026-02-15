import type { IWindow } from './IWindow';
import type { IIterable } from './utils/IIterable';
import type { PropertyStruct } from './utils/PropertyStruct';

/**
 * Base widget interface.
 *
 * Widgets are reusable UI components that can be embedded in window containers.
 *
 * @see sources/flash_version/com/sulake/core/window/IWidget.as
 */
export interface IWidget extends IIterable
{
    readonly disposed: boolean;
    readonly window: IWindow | null;
    properties: PropertyStruct[];

    initialize(k: number, window: IWindow): void;
    dispose(): void;
}
