import type { ISkinContainer } from './ISkinContainer';
import type { IWindow } from '../IWindow';

/**
 * Render queue item holding rendering state for a single window.
 *
 * Tracks the current drawable state, a refresh flag, and (in AS3) the
 * cached BitmapData buffer. In TypeScript, bitmap rendering is handled
 * by the SolidJS client, so this is a lightweight state tracker.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/WindowRendererItem.as
 */
export class WindowRendererItem
{
    protected static readonly RENDER_TYPE_NULL: number = 0;
    protected static readonly RENDER_TYPE_SKIN: number = 1;
    protected static readonly RENDER_TYPE_FILL: number = 2;

    private _skinContainer: ISkinContainer;
    private _disposed: boolean = false;
    private _refresh: boolean = false;
    private _previousState: number = 0xFFFFFFFF;
    private _currentState: number = 0;

    constructor(skinContainer: ISkinContainer)
    {
        this._skinContainer = skinContainer;
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Tests whether the window's drawable state has changed.
     *
     * @param window - The window to test
     * @returns True if the state changed since last render
     */
    public testForStateChange(window: IWindow): boolean
    {
        return this._skinContainer.getTheActualState(window.type, window.style, window.state) !== this._previousState;
    }

    /**
     * Marks this item as needing re-render for the given invalidation type.
     *
     * @param window - The window being invalidated
     * @param flags - The invalidation flags
     * @returns True if the invalidation caused a change
     */
    public invalidate(window: IWindow, flags: number): boolean
    {
        let changed = false;

        switch(flags)
        {
            case 1:
            case 2:
                this._refresh = true;
                changed = true;
                break;
            case 4:
                changed = true;
                break;
            case 8:
                this._currentState = this._skinContainer.getTheActualState(window.type, window.style, window.state);

                if(this._currentState !== this._previousState)
                {
                    this._refresh = true;
                    changed = true;
                }
                break;
            case 16:
                this._refresh = true;
                changed = true;
                break;
            case 32:
                changed = true;
                break;
        }

        return changed;
    }

    /**
     * Purges cached data.
     */
    public purge(): void
    {
        // No-op in TypeScript stub
    }

    public dispose(): void
    {
        if(!this._disposed)
        {
            this._disposed = true;
        }
    }
}
