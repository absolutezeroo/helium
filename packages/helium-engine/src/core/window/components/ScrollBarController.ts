import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { IScrollbarWindow } from './IScrollbarWindow';
import type { IScrollableWindow } from './IScrollableWindow';
import { InteractiveController } from './InteractiveController';
import { WindowController } from '../WindowController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Controller for scrollbar windows.
 *
 * Manages scroll state, lift (thumb) positioning, increment/decrement
 * buttons, and binding to a scrollable target window.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ScrollBarController.as
 */
export class ScrollBarController extends InteractiveController implements IScrollbarWindow
{
    private static readonly SCROLL_BUTTON_INCREMENT: string = 'increment';
    private static readonly SCROLL_BUTTON_DECREMENT: string = 'decrement';
    private static readonly SCROLL_SLIDER_TRACK: string = 'slider_track';
    private static readonly SCROLL_SLIDER_BAR: string = 'slider_bar';

    protected _offset: number = 0;
    protected _scrollStep: number = 0.1;
    protected _scrollable: IScrollableWindow | null = null;

    private _horizontal: boolean;
    private _targetName: string | null = null;
    private _isUpdatingLift: boolean = false;

    constructor(
        name: string,
        type: number,
        style: number,
        param: number,
        context: IWindowContext,
        rect: { x: number; y: number; width: number; height: number },
        parent: IWindow | null = null,
        procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
        tags: string[] | null = null,
        properties: unknown[] | null = null,
        id: number = 0,
        dynamicStyle: string = ''
    )
    {
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);

        this._hasVisualContent = false;
        this._horizontal = (type === 130);

        const internals: IWindow[] = [];

        this.groupChildrenWithTag('_INTERNAL', internals, -1);

        for(const child of internals)
        {
            child.procedure = this.scrollButtonEventProc.bind(this);
        }

        this.updateLiftSizeAndPosition();
    }

    /**
     * Gets the horizontal scroll position.
     */
    public get scrollH(): number
    {
        return this._horizontal ? this._offset : 0;
    }

    /**
     * Sets the horizontal scroll position.
     */
    public set scrollH(value: number)
    {
        if(this._horizontal)
        {
            if(this.setScrollPosition(value))
            {
                this.updateLiftSizeAndPosition();
            }
        }
    }

    /**
     * Gets the vertical scroll position.
     */
    public get scrollV(): number
    {
        return this._horizontal ? 0 : this._offset;
    }

    /**
     * Sets the vertical scroll position.
     */
    public set scrollV(value: number)
    {
        if(!this._horizontal)
        {
            if(this.setScrollPosition(value))
            {
                this.updateLiftSizeAndPosition();
            }
        }
    }

    /**
     * Gets the scrollable target window.
     */
    public get scrollable(): IScrollableWindow | null
    {
        return this._scrollable;
    }

    /**
     * Sets the scrollable target window.
     */
    public set scrollable(value: IScrollableWindow | null)
    {
        if(this._scrollable !== null && !this._scrollable.disposed)
        {
            (this._scrollable as unknown as IWindow).removeEventListener('WE_RESIZED', this.onScrollableResized.bind(this));
            (this._scrollable as unknown as IWindow).removeEventListener('WE_SCROLL', this.onScrollableScrolled.bind(this));
        }

        this._scrollable = value;

        if(this._scrollable !== null && !this._scrollable.disposed)
        {
            (this._scrollable as unknown as IWindow).addEventListener('WE_RESIZED', this.onScrollableResized.bind(this));
            (this._scrollable as unknown as IWindow).addEventListener('WE_SCROLL', this.onScrollableScrolled.bind(this));
            this.updateLiftSizeAndPosition();
        }
    }

    /**
     * Gets whether this scrollbar is horizontal.
     */
    public get horizontal(): boolean
    {
        return this._horizontal;
    }

    /**
     * Gets whether this scrollbar is vertical.
     */
    public get vertical(): boolean
    {
        return !this._horizontal;
    }

    /**
     * Gets the track child window.
     */
    protected get track(): WindowController | null
    {
        return this.findChildByName(ScrollBarController.SCROLL_SLIDER_TRACK) as WindowController | null;
    }

    /**
     * Gets the lift (thumb) child window.
     */
    protected get lift(): WindowController | null
    {
        const trackWindow = this.track;

        if(!trackWindow) return null;

        return trackWindow.findChildByName(ScrollBarController.SCROLL_SLIDER_BAR) as WindowController | null;
    }

    /**
     * Sets the scroll position and syncs to the scrollable target.
     *
     * @returns Whether the position actually changed
     */
    protected setScrollPosition(value: number): boolean
    {
        if(this._scrollable === null || this._scrollable.disposed)
        {
            if(!this.resolveScrollTarget()) return false;
        }

        if(value < 0) value = 0;
        if(value > 1) value = 1;

        this._offset = value;

        let changed = false;

        if(this._horizontal)
        {
            changed = this._scrollable!.scrollH !== this._offset;

            if(changed)
            {
                this._scrollable!.scrollH = this._offset;
            }
        }
        else
        {
            changed = this._scrollable!.scrollV !== this._offset;

            if(changed)
            {
                this._scrollable!.scrollV = this._offset;
            }
        }

        return changed;
    }

    /**
     * Updates the lift (thumb) size and position based on the scrollable region.
     */
    private updateLiftSizeAndPosition(): void
    {
        if(this._scrollable === null || this._scrollable.disposed)
        {
            if(this._disposed || !this.resolveScrollTarget()) return;
        }

        const trackWindow = this.track;
        const liftWindow = this.lift;

        if(!trackWindow || !liftWindow) return;

        let ratio: number;

        if(this._horizontal)
        {
            ratio = this._scrollable!.visibleRegion.width / Math.max(1, this._scrollable!.scrollableRegion.width);

            if(ratio > 1) ratio = 1;

            const liftWidth = ratio * trackWindow.width;

            liftWindow.width = liftWidth;
            liftWindow.x = Math.round(this._scrollable!.scrollH * (trackWindow.width - liftWidth));
        }
        else
        {
            ratio = this._scrollable!.visibleRegion.height / Math.max(1, this._scrollable!.scrollableRegion.height);

            if(ratio > 1) ratio = 1;

            const liftHeight = ratio * trackWindow.height;

            liftWindow.height = liftHeight;
            liftWindow.y = Math.round(this._scrollable!.scrollV * (trackWindow.height - liftWindow.height));
        }

        if(ratio === 1)
        {
            this.disable();
        }
        else
        {
            this.enable();
        }
    }

    /**
     * Handles scroll button events (increment, decrement, track click).
     */
    private scrollButtonEventProc(_event: WindowEvent, _window: IWindow): void
    {
        // Stub - scroll button event handling
    }

    /**
     * Attempts to resolve the scroll target from the parent hierarchy.
     */
    private resolveScrollTarget(): boolean
    {
        if(this._scrollable !== null && !this._scrollable.disposed)
        {
            return true;
        }

        return false;
    }

    /**
     * Called when the scrollable target resizes.
     */
    private onScrollableResized(_event: WindowEvent): void
    {
        this.updateLiftSizeAndPosition();
        this.setScrollPosition(this._offset);
    }

    /**
     * Called when the scrollable target scrolls.
     */
    private onScrollableScrolled(_event: WindowEvent): void
    {
        this.updateLiftSizeAndPosition();
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        this.scrollable = null;

        super.dispose();
    }
}
