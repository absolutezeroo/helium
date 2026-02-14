import type { IWindow } from '@core/window/IWindow';
import type { IHabboWindowManager } from './IHabboWindowManager';
import { HintTarget } from './HintTarget';

/**
 * Manages hint windows that point to registered UI elements.
 *
 * Supports two styles: vertical (1) and horizontal (default).
 * Uses the Motion framework for smooth animations.
 *
 * @see sources/win63_version/habbo/window/HintManager.as
 */
export class HintManager
{
    private static readonly VERTICAL_PADDING: number = 10;
    private static readonly ANIMATION_DURATION: number = 400;
    private static readonly MIN_DISTANCE: number = 15;

    private _windowManager: IHabboWindowManager;
    private _registeredWindows: Map<string, HintTarget> = new Map();
    private _activeHint: HintTarget | null = null;
    private _hint: IWindow | null = null;
    private _targetRect: { x: number; y: number; width: number; height: number } | null = null;
    private _currentRect: { x: number; y: number; width: number; height: number } | null = null;
    private _disposed: boolean = false;

    constructor(windowManager: IHabboWindowManager)
    {
        this._windowManager = windowManager;
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Registers a window for hint support.
     */
    public registerWindow(key: string, window: IWindow, style: number = 0): void
    {
        this._registeredWindows.set(key, new HintTarget(window, key, style));
    }

    /**
     * Unregisters a window.
     */
    public unregisterWindow(key: string): void
    {
        if(this._activeHint && this.activeKey === key)
        {
            this.hideHint();
        }

        this._registeredWindows.delete(key);
    }

    /**
     * Shows a hint for a registered window.
     */
    public showHint(key: string, rect: { x: number; y: number; width: number; height: number } | null = null): void
    {
        const target = this._registeredWindows.get(key);

        if(!target) return;

        this._activeHint = target;

        if(rect)
        {
            this._targetRect = rect;
        }
        else
        {
            this._targetRect = this.getTargetRect(target.window);
        }
    }

    /**
     * Hides the active hint.
     */
    public hideHint(): void
    {
        if(this._hint)
        {
            this._hint.visible = false;
        }

        this._activeHint = null;
        this._targetRect = null;
        this._currentRect = null;
    }

    /**
     * Hides hint if it matches the given key.
     */
    public hideMatchingHint(key: string): void
    {
        if(this.activeKey === key)
        {
            this.hideHint();
        }
    }

    /**
     * Update tick for hint positioning/animation.
     */
    public update(_time: number): void
    {
        if(!this._activeHint || !this._hint) return;

        const target = this._activeHint;
        const targetRect = this._targetRect ?? this.getTargetRect(target.window);

        if(!targetRect) return;

        const oscillation = Math.sin(Date.now() * 0.003);

        if(target.style === 1)
        {
            // Vertical style
            this._hint.x = targetRect.x + (targetRect.width - this._hint.width) / 2;
            this._hint.y = targetRect.y - this._hint.height - HintManager.VERTICAL_PADDING + (oscillation * 3);
        }
        else
        {
            // Horizontal style
            this._hint.x = targetRect.x + targetRect.width + HintManager.VERTICAL_PADDING + (oscillation * 3);
            this._hint.y = targetRect.y + (targetRect.height - this._hint.height) / 2;
        }
    }

    /**
     * Returns the key of the active hint.
     */
    private get activeKey(): string | null
    {
        return this._activeHint?.key ?? null;
    }

    /**
     * Calculates target rectangle for hint positioning.
     */
    private getTargetRect(window: IWindow): { x: number; y: number; width: number; height: number }
    {
        return {
            x: window.x,
            y: window.y,
            width: window.width,
            height: window.height
        };
    }

    /**
     * Dispose the hint manager.
     */
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this.hideHint();
        this._registeredWindows.clear();
        this._hint = null;
    }
}
