import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IScrollableListWindow} from './IScrollableListWindow';
import type {IItemListWindow} from './IItemListWindow';
import type {IScrollbarWindow} from './IScrollbarWindow';
import {ContainerController} from './ContainerController';
import {WindowEvent} from '../events/WindowEvent';

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

	private _autoHideScrollBar: boolean = true;

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
		if (this.itemList) this.itemList.autoArrangeItems = value;
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
		if (this.itemList) this.itemList.spacing = value;
	}

	public get numListItems(): number
	{
		return this.itemList?.numListItems ?? 0;
	}

	public get firstListItem(): IWindow | null
	{
		return this.itemList?.firstListItem ?? null;
	}

	public get lastListItem(): IWindow | null
	{
		return this.itemList?.lastListItem ?? null;
	}

	public get isPartOfGridWindow(): boolean
	{
		return this.itemList?.isPartOfGridWindow ?? false;
	}

	public set isPartOfGridWindow(value: boolean)
	{
		if(this.itemList) this.itemList.isPartOfGridWindow = value;
	}

	public get scrollH(): number
	{
		return this.itemList?.scrollH ?? 0;
	}

	public set scrollH(value: number)
	{
		if(this.itemList) this.itemList.scrollH = value;
	}

	public get scrollV(): number
	{
		return this.itemList?.scrollV ?? 0;
	}

	public set scrollV(value: number)
	{
		if(this.itemList) this.itemList.scrollV = value;
	}

	public get scrollStepH(): number
	{
		return this.itemList?.scrollStepH ?? 25;
	}

	public set scrollStepH(value: number)
	{
		if(this.itemList) this.itemList.scrollStepH = value;
	}

	public get scrollStepV(): number
	{
		return this.itemList?.scrollStepV ?? 25;
	}

	public set scrollStepV(value: number)
	{
		if(this.itemList) this.itemList.scrollStepV = value;
	}

	public get maxScrollH(): number
	{
		return this.itemList?.maxScrollH ?? 0;
	}

	public get maxScrollV(): number
	{
		return this.itemList?.maxScrollV ?? 0;
	}

	public get visibleRegion(): { x: number; y: number; width: number; height: number }
	{
		return this.itemList?.visibleRegion ?? { x: 0, y: 0, width: this.width, height: this.height };
	}

	public get scrollableRegion(): { x: number; y: number; width: number; height: number }
	{
		return this.itemList?.scrollableRegion ?? { x: 0, y: 0, width: 0, height: 0 };
	}

	// ── IItemListWindow delegation ──────────────────────────────────

	public get disableAutodrag(): boolean
	{
		return false;
	}

	public set disableAutodrag(value: boolean)
	{
		if(this.itemList) this.itemList.disableAutodrag = value;
	}

	/**
	 * Gets the internal item list child.
	 */
	protected get itemList(): IItemListWindow | null
	{
		if (!this._itemListRef)
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
		if (!this._scrollBarRef)
		{
			this._scrollBarRef = this.findChildByTag('_SCROLLBAR') as unknown as IScrollbarWindow | null;
		}

		return this._scrollBarRef;
	}

	/**
	 * Arranges items in the list.
	 */
	public arrangeItems(): void
	{
		this.itemList?.arrangeItems();
	}

	public addListItem(item: IWindow): IWindow
	{
		return this.itemList?.addListItem(item) ?? item;
	}

	public addListItemAt(item: IWindow, index: number): IWindow
	{
		return this.itemList?.addListItemAt(item, index) ?? item;
	}

	public getListItemAt(index: number): IWindow | null
	{
		return this.itemList?.getListItemAt(index) ?? null;
	}

	public getListItemByName(name: string): IWindow | null
	{
		return this.itemList?.getListItemByName(name) ?? null;
	}

	public getListItemByID(id: number): IWindow | null
	{
		return this.itemList?.getListItemByID(id) ?? null;
	}

	public getListItemByTag(tag: string): IWindow | null
	{
		return this.itemList?.getListItemByTag(tag) ?? null;
	}

	public getListItemIndex(item: IWindow): number
	{
		return this.itemList?.getListItemIndex(item) ?? -1;
	}

	public removeListItem(item: IWindow): IWindow | null
	{
		return this.itemList?.removeListItem(item) ?? null;
	}

	public removeListItemAt(index: number): IWindow | null
	{
		return this.itemList?.removeListItemAt(index) ?? null;
	}

	public removeListItems(): void
	{
		this.itemList?.removeListItems();
	}

	public destroyListItems(): void
	{
		this.itemList?.destroyListItems();
	}

	public setListItemIndex(item: IWindow, index: number): void
	{
		this.itemList?.setListItemIndex(item, index);
	}

	public swapListItems(a: IWindow, b: IWindow): void
	{
		this.itemList?.swapListItems(a, b);
	}

	public swapListItemsAt(indexA: number, indexB: number): void
	{
		this.itemList?.swapListItemsAt(indexA, indexB);
	}

	public groupListItemsWithID(id: number, result: IWindow[], depth: number = 0): number
	{
		return this.itemList?.groupListItemsWithID(id, result, depth) ?? 0;
	}

	public groupListItemsWithTag(tag: string, result: IWindow[], depth: number = 0): number
	{
		return this.itemList?.groupListItemsWithTag(tag, result, depth) ?? 0;
	}

	/**
	 * Scrolls the list by a wheel delta amount.
	 */
	public scrollWithWheel(delta: number): void
	{
		if (!this.itemList) return;

		// Stub — wheel scrolling will be implemented with the scroll system
	}

	public override dispose(): void
	{
		if (this._disposed) return;

		this._scrollBarRef = null;
		this._itemListRef = null;

		super.dispose();
	}
}
