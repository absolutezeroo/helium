import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { IScrollableListWindow } from './IScrollableListWindow';
import type { IItemListWindow } from './IItemListWindow';
import type { IScrollbarWindow } from './IScrollbarWindow';
import type { IIterator } from '../utils/IIterator';
import { ContainerController } from './ContainerController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Scrollable item list window.
 *
 * Combines an item list with a scrollbar. The scrollbar is automatically
 * bound to the item list and can optionally auto-hide when not needed.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ScrollableItemListWindow.as
 */
export class ScrollableItemListWindow extends ContainerController implements IScrollableListWindow
{
    private _itemListRef: IItemListWindow | null = null;
    private _scrollBarRef: IScrollbarWindow | null = null;
    private _autoHideScrollBar: boolean = true;

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
    }

    /**
     * Gets the internal item list child.
     */
    protected get itemList(): IItemListWindow | null
    {
        if(!this._itemListRef)
        {
            this._itemListRef = this.findChildByTag('_ITEMLIST') as unknown as IItemListWindow | null;
        }

        return this._itemListRef;
    }

    /**
     * Gets the internal scrollbar child.
     */
    protected get scrollBar(): IScrollbarWindow | null
    {
        if(!this._scrollBarRef)
        {
            this._scrollBarRef = this.findChildByTag('_SCROLLBAR') as unknown as IScrollbarWindow | null;
        }

        return this._scrollBarRef;
    }

    /**
     * Gets whether auto-hide scrollbar is enabled.
     */
    public get autoHideScrollBar(): boolean
    {
        return this._autoHideScrollBar;
    }

    /**
     * Sets whether auto-hide scrollbar is enabled.
     */
    public set autoHideScrollBar(value: boolean)
    {
        this._autoHideScrollBar = value;
    }

    /**
     * Gets whether items auto-arrange.
     */
    public get autoArrangeItems(): boolean
    {
        return this.itemList?.autoArrangeItems ?? true;
    }

    /**
     * Sets whether items auto-arrange.
     */
    public set autoArrangeItems(value: boolean)
    {
        if(this.itemList) this.itemList.autoArrangeItems = value;
    }

    /**
     * Gets the spacing between items.
     */
    public get spacing(): number
    {
        return this.itemList?.spacing ?? 0;
    }

    /**
     * Sets the spacing between items.
     */
    public set spacing(value: number)
    {
        if(this.itemList) this.itemList.spacing = value;
    }

    /**
     * Arranges items in the list.
     */
    public arrangeItems(): void
    {
        this.itemList?.arrangeItems();
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        this._scrollBarRef = null;
        this._itemListRef = null;

        super.dispose();
    }
}
