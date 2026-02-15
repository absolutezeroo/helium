import type { IInternalWindowServices } from './IInternalWindowServices';
import type { IMouseDraggingService } from './IMouseDraggingService';
import type { IMouseScalingService } from './IMouseScalingService';
import type { IMouseListenerService } from './IMouseListenerService';
import type { IFocusManagerService } from './IFocusManagerService';
import type { IToolTipAgentService } from './IToolTipAgentService';
import type { IGestureAgentService } from './IGestureAgentService';
import type { IWindow } from '../IWindow';
import { WindowMouseDragger } from './WindowMouseDragger';
import { WindowMouseScaler } from './WindowMouseScaler';

/**
 * Aggregates all internal window services.
 *
 * Creates and owns the mouse dragger, scaler, and stubs for
 * listener, focus, tooltip, and gesture services.
 *
 * @see sources/win63_version/core/window/services/ServiceManager.as
 */
export class ServiceManager implements IInternalWindowServices
{
    private _dragger: WindowMouseDragger;
    private _scaler: WindowMouseScaler;
    private _mouseListener: IMouseListenerService;
    private _focusManager: IFocusManagerService;
    private _toolTipAgent: IToolTipAgentService;
    private _gestureAgent: IGestureAgentService;
    private _disposed: boolean = false;

    constructor()
    {
        this._dragger = new WindowMouseDragger();
        this._scaler = new WindowMouseScaler();

        // Stub services — will be replaced by real implementations later
        this._mouseListener = {
            eventTypes: [],
            areaLimit: 0,
            begin(_window: IWindow): void { /* stub */ },
            end(_window: IWindow): void { /* stub */ },
        };

        this._focusManager = {
            setFocus(_window: IWindow | null): void { /* stub */ },
            getFocus(): IWindow | null { return null; },
        };

        this._toolTipAgent = {
            show(_window: IWindow, _text: string): void { /* stub */ },
            hide(): void { /* stub */ },
        };

        this._gestureAgent = {
            disposed: false,
            dispose(): void { /* stub */ },
        };
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public getMouseDraggingService(): IMouseDraggingService
    {
        return this._dragger;
    }

    public getMouseScalingService(): IMouseScalingService
    {
        return this._scaler;
    }

    public getMouseListenerService(): IMouseListenerService
    {
        return this._mouseListener;
    }

    public getFocusManagerService(): IFocusManagerService
    {
        return this._focusManager;
    }

    public getToolTipAgentService(): IToolTipAgentService
    {
        return this._toolTipAgent;
    }

    public getGestureAgentService(): IGestureAgentService
    {
        return this._gestureAgent;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this._dragger.dispose();
        this._scaler.dispose();
    }
}
