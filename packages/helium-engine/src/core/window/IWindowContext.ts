import type { IWindow } from './IWindow';
import type { IWindowParser } from './utils/IWindowParser';

/**
 * Window context interface.
 *
 * A context represents a layer in which windows are created and managed.
 * Each layer has its own factory, parser, desktop, and event processing.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/IWindowContext.as
 */
export interface IWindowContext
{
    readonly disposed: boolean;

    getWindowServices(): IInternalWindowServices;
    getWindowParser(): IWindowParser;
    getWindowFactory(): IWindowFactory;
    getWidgetFactory(): IWidgetFactory | null;
    getDesktopWindow(): IWindow | null;
    registerLocalizationListener(key: string, window: IWindow): void;
    removeLocalizationListener(key: string, window: IWindow): void;
    findWindowByName(name: string): IWindow | null;
    findWindowByTag(tag: string): IWindow | null;
    groupChildrenWithTag(tag: string, result: IWindow[], depth?: number): number;
    create(
        layerName: string,
        name: string,
        type: number,
        style: number,
        param: number,
        rect: { x: number; y: number; width: number; height: number },
        procedure: ((event: unknown, window: IWindow) => void) | null,
        parent: IWindow | null,
        id: number,
        tags?: string[] | null,
        dynamicStyle?: string,
        properties?: unknown[] | null
    ): IWindow;
    destroy(window: IWindow): boolean;
    invalidate(window: IWindow, rect: { x: number; y: number; width: number; height: number } | null, flags: number): void;
    getLastError(): Error | null;
    getLastErrorCode(): number;
    flushError(): void;
    addMouseEventTracker(tracker: IInputEventTracker): void;
    removeMouseEventTracker(tracker: IInputEventTracker): void;
    dispose(): void;
}

// Forward declarations for interfaces defined elsewhere
import type { IInputEventTracker } from './IInputEventTracker';
import type { IInternalWindowServices } from './services/IInternalWindowServices';
import type { IWindowFactory } from './IWindowFactory';
import type { IWidgetFactory } from './IWidgetFactory';
