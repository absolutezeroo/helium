import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IItemGridWindow} from './IItemGridWindow';
import {ContainerController} from './ContainerController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for item grid windows.
 *
 * An item grid arranges children in a two-dimensional grid layout
 * by distributing items across column lists.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ItemGridController.as
 */
export class ItemGridController extends ContainerController implements IItemGridWindow
{
	private _columnCount: number = 0;
	private _rowCount: number = 0;
	private _isRebuilding: boolean = false;
	private _isHorizontal: boolean = false;
	private _hasCustomVerticalSpacing: boolean = false;

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

		this._isHorizontal = (type !== 54);
		this._scaleToFitItems = true;
	}

	private _columnWidth: number = 0;

	/**
	 * Gets the column width.
	 */
	public get columnWidth(): number
	{
		return this._columnWidth;
	}

	/**
	 * Sets the column width.
	 */
	public set columnWidth(value: number)
	{
		this._columnWidth = value;
	}

	private _rowHeight: number = 0;

	/**
	 * Gets the row height.
	 */
	public get rowHeight(): number
	{
		return this._rowHeight;
	}

	/**
	 * Sets the row height.
	 */
	public set rowHeight(value: number)
	{
		this._rowHeight = value;
	}

	private _containerResizeToColumns: boolean = false;

	/**
	 * Gets whether columns resize to fit content.
	 */
	public get containerResizeToColumns(): boolean
	{
		return this._containerResizeToColumns;
	}

	/**
	 * Sets whether columns resize to fit content.
	 */
	public set containerResizeToColumns(value: boolean)
	{
		this._containerResizeToColumns = value;
	}

	private _shouldRebuildGridOnResize: boolean = true;

	/**
	 * Gets whether the grid should rebuild on resize.
	 */
	public get shouldRebuildGridOnResize(): boolean
	{
		return this._shouldRebuildGridOnResize;
	}

	/**
	 * Sets whether the grid should rebuild on resize.
	 */
	public set shouldRebuildGridOnResize(value: boolean)
	{
		this._shouldRebuildGridOnResize = value;
	}

	private _spacing: number = 0;

	/**
	 * Gets the spacing between items.
	 */
	public get spacing(): number
	{
		return this._spacing;
	}

	/**
	 * Sets the spacing between items.
	 */
	public set spacing(value: number)
	{
		this._spacing = value;
	}

	private _verticalSpacing: number = 0;

	/**
	 * Gets the vertical spacing.
	 */
	public get verticalSpacing(): number
	{
		return this._verticalSpacing;
	}

	/**
	 * Sets the vertical spacing for grid columns.
	 */
	public set verticalSpacing(value: number)
	{
		this._verticalSpacing = value;
		this._hasCustomVerticalSpacing = true;
	}

	private _scaleToFitItems: boolean = true;

	/**
	 * Gets whether items are scaled to fit.
	 */
	public get scaleToFitItems(): boolean
	{
		return this._scaleToFitItems;
	}

	/**
	 * Sets whether items are scaled to fit.
	 */
	public set scaleToFitItems(value: boolean)
	{
		this._scaleToFitItems = value;
	}

	private _autoArrangeItems: boolean = true;

	/**
	 * Gets whether items are auto-arranged.
	 */
	public get autoArrangeItems(): boolean
	{
		return this._autoArrangeItems;
	}

	/**
	 * Sets whether items are auto-arranged.
	 */
	public set autoArrangeItems(value: boolean)
	{
		this._autoArrangeItems = value;
	}

	private _resizeOnItemUpdate: boolean = false;

	/**
	 * Gets whether the list resizes on item update.
	 */
	public get resizeOnItemUpdate(): boolean
	{
		return this._resizeOnItemUpdate;
	}

	/**
	 * Sets whether the list resizes on item update.
	 */
	public set resizeOnItemUpdate(value: boolean)
	{
		this._resizeOnItemUpdate = value;
	}

	private _scrollH: number = 0;

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
		if (value < 0) value = 0;
		if (value > 1) value = 1;

		this._scrollH = value;
	}

	private _scrollV: number = 0;

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
		if (value < 0) value = 0;
		if (value > 1) value = 1;

		this._scrollV = value;
	}

	private _scrollStepH: number = -1;

	/**
	 * Gets the horizontal scroll step size.
	 */
	public get scrollStepH(): number
	{
		if (this._scrollStepH >= 0) return this._scrollStepH;

		return this._isHorizontal
			? (0.1 * this.scrollableRegion.height)
			: (this.scrollableRegion.width / Math.max(1, this._columnCount));
	}

	/**
	 * Sets the horizontal scroll step size.
	 */
	public set scrollStepH(value: number)
	{
		this._scrollStepH = value;
	}

	private _scrollStepV: number = -1;

	/**
	 * Gets the vertical scroll step size.
	 */
	public get scrollStepV(): number
	{
		if (this._scrollStepV >= 0) return this._scrollStepV;

		return this._isHorizontal
			? (this.scrollableRegion.height / Math.max(1, this._rowCount))
			: (0.1 * this.scrollableRegion.width);
	}

	/**
	 * Sets the vertical scroll step size.
	 */
	public set scrollStepV(value: number)
	{
		this._scrollStepV = value;
	}

	/**
	 * Gets the number of columns in the grid.
	 */
	public get numColumns(): number
	{
		return this._columnCount;
	}

	/**
	 * Gets the number of rows in the grid.
	 */
	public get numRows(): number
	{
		return this._rowCount;
	}

	/**
	 * Gets the total number of items across all grid columns.
	 */
	public get numGridItems(): number
	{
		return this._columnCount * this._rowCount;
	}

	/**
	 * Gets the maximum horizontal scroll value.
	 */
	public get maxScrollH(): number
	{
		return Math.max(0, (this._columnCount * this._columnWidth) - this.width);
	}

	/**
	 * Gets the maximum vertical scroll value.
	 */
	public get maxScrollV(): number
	{
		return Math.max(0, (this._rowCount * this._rowHeight) - this.height);
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
			width: this._columnCount * this._columnWidth,
			height: this._rowCount * this._rowHeight
		};
	}

	/**
	 * Adds an item to the grid.
	 */
	public addGridItem(item: IWindow): IWindow
	{
		this.addChild(item);
		this.recalculateGrid();

		return item;
	}

	/**
	 * Adds an item at the specified grid index.
	 */
	public addGridItemAt(item: IWindow, index: number): IWindow
	{
		this.addChildAt(item, Math.min(this.numChildren, index));
		this.recalculateGrid();

		return item;
	}

	/**
	 * Gets the item at the specified grid index.
	 */
	public getGridItemAt(index: number): IWindow | null
	{
		return this.getChildAt(index);
	}

	/**
	 * Gets the item with the specified ID.
	 */
	public getGridItemByID(id: number): IWindow | null
	{
		return this.getChildByID(id);
	}

	/**
	 * Gets the item with the specified name.
	 */
	public getGridItemByName(name: string): IWindow | null
	{
		return this.getChildByName(name);
	}

	/**
	 * Gets the item with the specified tag.
	 */
	public getGridItemByTag(tag: string): IWindow | null
	{
		return this.getChildByTag(tag);
	}

	/**
	 * Gets the grid index of the specified item.
	 */
	public getGridItemIndex(item: IWindow): number
	{
		return this.getChildIndex(item);
	}

	/**
	 * Removes an item from the grid.
	 */
	public removeGridItem(item: IWindow): IWindow | null
	{
		const result = this.removeChild(item);

		if (result) this.recalculateGrid();

		return result;
	}

	/**
	 * Removes the item at the specified grid index.
	 */
	public removeGridItemAt(index: number): IWindow | null
	{
		const result = this.removeChildAt(index);

		if (result) this.recalculateGrid();

		return result;
	}

	/**
	 * Sets the grid index of the specified item.
	 */
	public setGridItemIndex(item: IWindow, index: number): void
	{
		this.setChildIndex(item, index);
		this.recalculateGrid();
	}

	/**
	 * Swaps two items in the grid.
	 */
	public swapGridItems(a: IWindow, b: IWindow): void
	{
		this.swapChildren(a, b);
		this.recalculateGrid();
	}

	/**
	 * Swaps two items at the specified grid indices.
	 */
	public swapGridItemsAt(indexA: number, indexB: number): void
	{
		this.swapChildrenAt(indexA, indexB);
		this.recalculateGrid();
	}

	/**
	 * Removes all items from the grid.
	 */
	public removeGridItems(): void
	{
		while (this.numChildren > 0)
		{
			this.removeChildAt(0);
		}

		this.recalculateGrid();
	}

	/**
	 * Destroys all items in the grid.
	 */
	public destroyGridItems(): void
	{
		while (this.numChildren > 0)
		{
			const child = this.removeChildAt(0);

			if (child) child.destroy();
		}

		this.recalculateGrid();
	}

	/**
	 * Rebuilds the grid structure from the current items.
	 */
	public rebuildGridStructure(): void
	{
		if (this._isRebuilding) return;

		this._isRebuilding = true;
		this.recalculateGrid();
		this._isRebuilding = false;
	}

	/**
	 * Populates the grid with the given items.
	 */
	public populate(items: IWindow[]): void
	{
		for (const item of items)
		{
			this.addGridItem(item);
		}
	}

	/**
	 * Recalculates the grid layout based on current items and dimensions.
	 */
	private recalculateGrid(): void
	{
		const count = this.numChildren;

		if (this._columnWidth > 0)
		{
			this._columnCount = Math.max(1, Math.floor(this.width / this._columnWidth));
		}
		else
		{
			this._columnCount = Math.max(1, count);
		}

		this._rowCount = Math.ceil(count / Math.max(1, this._columnCount));

		for (let i = 0; i < count; i++)
		{
			const child = this.getChildAt(i);

			if (child)
			{
				const col = i % this._columnCount;
				const row = Math.floor(i / this._columnCount);

				child.x = col * (this._columnWidth > 0 ? this._columnWidth : child.width) + col * this._spacing;
				child.y = row * (this._rowHeight > 0 ? this._rowHeight : child.height) + row * (this._hasCustomVerticalSpacing ? this._verticalSpacing : this._spacing);
			}
		}
	}
}
