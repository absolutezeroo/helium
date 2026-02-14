import type { IRectLimiter } from './utils/IRectLimiter';
import type { PropertyStruct } from './utils/PropertyStruct';
import type { IWindowContext } from './IWindowContext';
import type { WindowEvent } from './events/WindowEvent';

/**
 * Core window interface.
 *
 * Defines the complete API for a window element: position, size, style, state,
 * param, events, hit-testing, children lookup, and coordinate conversion.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/IWindow.as
 */
export interface IWindow
{
    // ── Position & Size ──────────────────────────────────────────────
    x: number;
    y: number;
    width: number;
    height: number;
    position: { x: number; y: number };
    rectangle: { x: number; y: number; width: number; height: number };
    readonly renderingRectangle: { x: number; y: number; width: number; height: number };
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly renderingX: number;
    readonly renderingY: number;
    readonly renderingWidth: number;
    readonly renderingHeight: number;
    readonly etchingPoint: { x: number; y: number };

    // ── Identity ─────────────────────────────────────────────────────
    id: number;
    name: string;
    caption: string;
    tags: string[];

    // ── Type, Style, State, Param ────────────────────────────────────
    type: number;
    style: number;
    state: number;
    param: number;

    // ── Visual Properties ────────────────────────────────────────────
    visible: boolean;
    background: boolean;
    color: number;
    alpha: number;
    blend: number;
    clipping: boolean;
    debug: boolean;
    filters: unknown[];
    dynamicStyle: string;
    dynamicStyleColor: { redMultiplier: number; greenMultiplier: number; blueMultiplier: number; alphaMultiplier: number } | null;

    // ── Behavior ─────────────────────────────────────────────────────
    procedure: ((event: WindowEvent, window: IWindow) => void) | null;
    mouseThreshold: number;
    immediateClickMode: boolean;
    properties: unknown[];
    etching: unknown[];

    // ── Hierarchy ────────────────────────────────────────────────────
    parent: IWindow | null;
    readonly context: IWindowContext;
    readonly desktop: IWindow | null;
    readonly host: IWindow;
    readonly limits: IRectLimiter;

    // ── Lifecycle ────────────────────────────────────────────────────
    readonly disposed: boolean;
    dispose(): void;
    destroy(): boolean;
    clone(): IWindow;

    // ── Layout ───────────────────────────────────────────────────────
    invalidate(rect?: { x: number; y: number; width: number; height: number } | null): void;
    resolve(): number;
    center(): void;
    offset(dx: number, dy: number): void;
    scale(sx: number, sy: number): void;

    // ── Build ────────────────────────────────────────────────────────
    buildFromJSON(layout: Record<string, unknown>, namedWindows?: Map<string, IWindow> | null): boolean;

    // ── Draw ─────────────────────────────────────────────────────────
    fetchDrawBuffer(): unknown;
    getDrawRegion(out: { x: number; y: number; width: number; height: number }): void;

    // ── Mouse / Hit Testing ──────────────────────────────────────────
    getRelativeMousePosition(out: { x: number; y: number }): void;
    getAbsoluteMousePosition(out: { x: number; y: number }): void;
    getMouseRegion(out: { x: number; y: number; width: number; height: number }): void;

    // ── Coordinate Conversion ────────────────────────────────────────
    getLocalPosition(out: { x: number; y: number }): void;
    getLocalRectangle(out: { x: number; y: number; width: number; height: number }): void;
    hitTestLocalPoint(point: { x: number; y: number }): boolean;
    hitTestLocalRectangle(rect: { x: number; y: number; width: number; height: number }): boolean;
    getGlobalPosition(out: { x: number; y: number }): void;
    setGlobalPosition(point: { x: number; y: number }): void;
    getGlobalRectangle(out: { x: number; y: number; width: number; height: number }): void;
    setGlobalRectangle(rect: { x: number; y: number; width: number; height: number }): void;
    hitTestGlobalPoint(point: { x: number; y: number }): boolean;
    hitTestGlobalRectangle(rect: { x: number; y: number; width: number; height: number }): boolean;
    resolveVerticalScale(): number;
    resolveHorizontalScale(): number;
    convertPointFromLocalToGlobalSpace(point: { x: number; y: number }): void;
    convertPointFromGlobalToLocalSpace(point: { x: number; y: number }): void;

    // ── Hierarchy Search ─────────────────────────────────────────────
    findParentByName(name: string): IWindow | null;

    // ── Flag Operations ──────────────────────────────────────────────
    setStateFlag(flag: number, value?: boolean): void;
    getStateFlag(flag: number): boolean;
    testStateFlag(flag: number, mask?: number): boolean;
    setStyleFlag(flag: number, value?: boolean): void;
    getStyleFlag(flag: number): boolean;
    testStyleFlag(flag: number, mask?: number): boolean;
    setParamFlag(flag: number, value?: boolean): void;
    getParamFlag(flag: number): boolean;
    testParamFlag(flag: number, mask?: number): boolean;

    // ── Window State Operations ──────────────────────────────────────
    minimize(): boolean;
    maximize(): boolean;
    restore(): boolean;
    activate(): boolean;
    deactivate(): boolean;
    lock(): boolean;
    unlock(): boolean;
    enable(): boolean;
    disable(): boolean;
    isEnabled(): boolean;

    // ── Events ───────────────────────────────────────────────────────
    addEventListener(type: string, listener: Function, priority?: number): void;
    removeEventListener(type: string, listener: Function): void;
    hasEventListener(type: string): boolean;

    // ── Properties ───────────────────────────────────────────────────
    createProperty(key: string, value: unknown): PropertyStruct;
    getDefaultProperty(key: string): PropertyStruct | null;

    // ── Child Utilities ──────────────────────────────────────────────
    enableChildren(enable: boolean, exceptions: string[]): void;
    activateChildren(activate: boolean, exceptions: string[]): void;
    setVisibleChildren(visible: boolean, exceptions: string[]): void;

    // ── String ───────────────────────────────────────────────────────
    toString(): string;
}
