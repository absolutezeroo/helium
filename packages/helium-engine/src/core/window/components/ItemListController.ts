import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { IItemListWindow } from './IItemListWindow';
import { ContainerController } from './ContainerController';
import { WindowController } from '../WindowController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Controller for item list windows.
 *
 * An item list arranges children in a single-axis layout (horizontal or
 * vertical) with optional spacing, auto-arrangement, and scroll support.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ItemListController.as
 */
export class ItemListController extends ContainerController implements IItemListWindow
{
    private _disableAutodrag: boolean = false;
    private _isPartOfGridWindow: boolean = false;

    protected _scrollH: number = 0;
    protected _scrollV: number = 0;
    protected _scrollAreaWidth: number = 0;
    protected _scrollAreaHeight: number = 0;
    protected _isUpdating: boolean = false;
    protected _isHorizontal: boolean = false;
    protected _scrollStepH: number = -1;
    protected _scrollStepV: number = -1;
    protected _arrangeListItems: boolean = true;
    protected _scaleToFitItems: boolean = false;
    protected _resizeOnItemUpdate: boolean = false;
    protected _spacing: number = 0;

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

        this._isHorizontal = (type === 51);
        this._spacing = 0;
        this._arrangeListItems = true;
        this._scaleToFitItems = false;
        this._resizeOnItemUpdate = false;
    }

    /**
     * Gets the spacing between list items.
     */
    public get spacing(): number
    {
        return this._spacing;
    }

    /**
     * Sets the spacing between list items.
     */
    public set spacing(value: number)
    {
        if(value !== this._spacing)
        {
            this._spacing = value;
            this.arrangeItems();
        }
    }

    /**
     * Gets the horizontal scroll position (0..1).
     */
    public get scrollH(): number
    {
        return this._scrollH;
    }

    /**
     * Sets the horizontal scroll position (0..1).
     */
    public set scrollH(value: number)
    {
        if(value < 0) value = 0;
        if(value > 1) value = 1;

        if(value !== this._scrollH)
        {
            this._scrollH = value;
        }
    }

    /**
     * Gets the vertical scroll position (0..1).
     */
    public get scrollV(): number
    {
        return this._scrollV;
    }

    /**
     * Sets the vertical scroll position (0..1).
     */
    public set scrollV(value: number)
    {
        if(value < 0) value = 0;
        if(value > 1) value = 1;

        if(value !== this._scrollV)
        {
            this._scrollV = value;
        }
    }

    /**
     * Gets the maximum horizontal scroll value.
     */
    public get maxScrollH(): number
    {
        return Math.max(0, this._scrollAreaWidth - this.width);
    }

    /**
     * Gets the maximum vertical scroll value.
     */
    public get maxScrollV(): number
    {
        return Math.max(0, this._scrollAreaHeight - this.height);
    }

    /**
     * Gets the horizontal scroll step size.
     */
    public get scrollStepH(): number
    {
        if(this._scrollStepH >= 0) return this._scrollStepH;

        return this._isHorizontal ? (this.width / Math.max(1, this.numListItems)) : (0.1 * this.width);
    }

    /**
     * Gets the vertical scroll step size.
     */
    public get scrollStepV(): number
    {
        if(this._scrollStepV >= 0) return this._scrollStepV;

        return this._isHorizontal ? (0.1 * this.height) : (this.height / Math.max(1, this.numListItems));
    }

    /**
     * Sets the horizontal scroll step size.
     */
    public set scrollStepH(value: number)
    {
        this._scrollStepH = value;
    }

    /**
     * Sets the vertical scroll step size.
     */
    public set scrollStepV(value: number)
    {
        this._scrollStepV = value;
    }

    /**
     * Gets whether this list is part of a grid window.
     */
    public get isPartOfGridWindow(): boolean
    {
        return this._isPartOfGridWindow;
    }

    /**
     * Sets whether this list is part of a grid window.
     */
    public set isPartOfGridWindow(value: boolean)
    {
        this._isPartOfGridWindow = value;
    }

    /**
     * Gets the visible region rectangle.
     */
    public get visibleRegion(): { x: number; y: number; width: number; height: number }
    {
        return {
            x: this._scrollH * this.maxScrollH,
            y: this._scrollV * this.maxScrollV,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Gets the scrollable region rectangle.
     */
    public get scrollableRegion(): { x: number; y: number; width: number; height: number }
    {
        return {
            x: 0,
            y: 0,
            width: this._scrollAreaWidth,
            height: this._scrollAreaHeight
        };
    }

    /**
     * Gets whether items are automatically arranged.
     */
    public get autoArrangeItems(): boolean
    {
        return this._arrangeListItems;
    }

    /**
     * Sets whether items are automatically arranged.
     */
    public set autoArrangeItems(value: boolean)
    {
        this._arrangeListItems = value;
        this.arrangeItems();
    }

    /**
     * Gets whether items are scaled to fit the list.
     */
    public get scaleToFitItems(): boolean
    {
        return this._scaleToFitItems;
    }

    /**
     * Sets whether items are scaled to fit the list.
     */
    public set scaleToFitItems(value: boolean)
    {
        if(this._scaleToFitItems !== value)
        {
            this._scaleToFitItems = value;
            this.arrangeItems();
        }
    }

    /**
     * Gets whether the list resizes when items are updated.
     */
    public get resizeOnItemUpdate(): boolean
    {
        return this._resizeOnItemUpdate;
    }

    /**
     * Sets whether the list resizes when items are updated.
     */
    public set resizeOnItemUpdate(value: boolean)
    {
        this._resizeOnItemUpdate = value;
    }

    /**
     * Gets the number of items in the list.
     */
    public get numListItems(): number
    {
        return this.numChildren;
    }

    /**
     * Returns the first item in the list.
     */
    public get firstListItem(): IWindow | null
    {
        return this.numListItems > 0 ? this.getListItemAt(0) : null;
    }

    /**
     * Returns the last item in the list.
     */
    public get lastListItem(): IWindow | null
    {
        return this.numListItems > 0 ? this.getListItemAt(this.numListItems - 1) : null;
    }

    /**
     * Adds an item to the end of the list.
     */
    public addListItem(item: IWindow): IWindow
    {
        if(this._isHorizontal)
        {
            if(this._arrangeListItems)
            {
                item.x = this._scrollAreaWidth + (this.numListItems > 0 ? this._spacing : 0);
                this._scrollAreaWidth = item.right;
            }
        }
        else
        {
            if(this._arrangeListItems)
            {
                item.y = this._scrollAreaHeight + (this.numListItems > 0 ? this._spacing : 0);
                this._scrollAreaHeight = item.bottom;
            }
            else
            {
                this._scrollAreaHeight = Math.max(this._scrollAreaHeight, item.bottom);
            }
        }

        return this.addChild(item);
    }

    /**
     * Adds an item at the specified index.
     */
    public addListItemAt(item: IWindow, index: number): IWindow
    {
        const result = this.addChildAt(item, index);

        this.arrangeItems();

        return result;
    }

    /**
     * Gets the item at the specified index.
     */
    public getListItemAt(index: number): IWindow | null
    {
        return this.getChildAt(index);
    }

    /**
     * Gets the item with the specified ID.
     */
    public getListItemByID(id: number): IWindow | null
    {
        return this.getChildByID(id);
    }

    /**
     * Gets the item with the specified name.
     */
    public getListItemByName(name: string): IWindow | null
    {
        return this.getChildByName(name);
    }

    /**
     * Gets the item with the specified tag.
     */
    public getListItemByTag(tag: string): IWindow | null
    {
        return this.getChildByTag(tag);
    }

    /**
     * Gets the index of the specified item.
     */
    public getListItemIndex(item: IWindow): number
    {
        return this.getChildIndex(item);
    }

    /**
     * Removes the specified item from the list.
     */
    public removeListItem(item: IWindow): IWindow | null
    {
        const result = this.removeChild(item);

        if(result)
        {
            this.arrangeItems();
        }

        return result;
    }

    /**
     * Removes the item at the specified index.
     */
    public removeListItemAt(index: number): IWindow | null
    {
        return this.removeChildAt(index);
    }

    /**
     * Sets the index of the specified item.
     */
    public setListItemIndex(item: IWindow, index: number): void
    {
        this.setChildIndex(item, index);
    }

    /**
     * Swaps two items in the list.
     */
    public swapListItems(a: IWindow, b: IWindow): void
    {
        this.swapChildren(a, b);
        this.arrangeItems();
    }

    /**
     * Swaps two items at the specified indices.
     */
    public swapListItemsAt(indexA: number, indexB: number): void
    {
        this.swapChildrenAt(indexA, indexB);
        this.arrangeItems();
    }

    /**
     * Groups list items with the specified ID.
     */
    public groupListItemsWithID(id: number, result: IWindow[], depth: number = 0): number
    {
        return this.groupChildrenWithID(id, result, depth);
    }

    /**
     * Groups list items with the specified tag.
     */
    public groupListItemsWithTag(tag: string, result: IWindow[], depth: number = 0): number
    {
        return this.groupChildrenWithTag(tag, result, depth);
    }

    /**
     * Removes all items from the list.
     */
    public removeListItems(): void
    {
        while(this.numListItems > 0)
        {
            this.removeChildAt(0);
        }

        this.arrangeItems();
    }

    /**
     * Destroys all items in the list.
     */
    public destroyListItems(): void
    {
        while(this.numListItems > 0)
        {
            const child = this.removeChildAt(0);

            if(child) child.destroy();
        }

        this.arrangeItems();
    }

    /**
     * Arranges items in the list based on current settings.
     */
    public arrangeItems(): void
    {
        if(!this._arrangeListItems || this._isUpdating) return;

        this._isUpdating = true;

        const count = this.numChildren;

        if(this._isHorizontal)
        {
            this._scrollAreaWidth = 0;

            for(let i = 0; i < count; i++)
            {
                const child = this.getChildAt(i);

                if(child && child.visible)
                {
                    child.x = this._scrollAreaWidth;
                    this._scrollAreaWidth += child.width + this._spacing;

                    if(this._scaleToFitItems)
                    {
                        const bottom = child.height + child.y;

                        this._scrollAreaHeight = Math.max(this._scrollAreaHeight, bottom);
                    }
                }
            }

            if(count > 0)
            {
                this._scrollAreaWidth -= this._spacing;
            }
        }
        else
        {
            this._scrollAreaHeight = 0;

            for(let i = 0; i < count; i++)
            {
                const child = this.getChildAt(i);

                if(child && child.visible)
                {
                    child.y = this._scrollAreaHeight;
                    this._scrollAreaHeight += child.height + this._spacing;

                    if(this._scaleToFitItems)
                    {
                        const right = child.width + child.x;

                        this._scrollAreaWidth = Math.max(this._scrollAreaWidth, right);
                    }
                }
            }

            if(count > 0)
            {
                this._scrollAreaHeight -= this._spacing;
            }
        }

        this._isUpdating = false;
    }

    /**
     * Stops any active drag operation.
     */
    public stopDragging(): void
    {
        // No-op in base implementation
    }

    /**
     * Sets whether automatic dragging is disabled.
     */
    public set disableAutodrag(value: boolean)
    {
        this._disableAutodrag = value;
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        super.dispose();
    }
}
