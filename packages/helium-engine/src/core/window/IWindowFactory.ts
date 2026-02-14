import type { IWindow } from './IWindow';
import type { DefaultAttStruct } from './utils/DefaultAttStruct';

/**
 * Window factory interface.
 *
 * Creates and destroys windows, provides layout and default attribute lookups,
 * and gives access to the theme manager.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/IWindowFactory.as
 */
export interface IWindowFactory
{
    create(
        name: string,
        type: number,
        style: number,
        param: number,
        rect: { x: number; y: number; width: number; height: number },
        procedure?: ((event: unknown, window: IWindow) => void) | null,
        dynamicStyle?: string,
        id?: number,
        tags?: string[] | null,
        parent?: IWindow | null,
        properties?: unknown[] | null,
        layerName?: string
    ): IWindow;

    destroy(window: IWindow): void;

    buildFromJSON(
        layout: Record<string, unknown>,
        contextLayer?: number,
        namedWindows?: Map<string, IWindow> | null
    ): IWindow | null;

    windowToLayoutString(window: IWindow): string;

    getLayoutByTypeAndStyle(type: number, style: number): Record<string, unknown> | null;

    getDefaultsByTypeAndStyle(type: number, style: number): DefaultAttStruct | null;

    getThemeManager(): IThemeManager;
}

import type { IThemeManager } from './theme/IThemeManager';
