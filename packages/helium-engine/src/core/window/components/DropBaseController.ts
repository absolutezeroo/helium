import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {PropertyStruct} from '../utils/PropertyStruct';
import {InteractiveController} from './InteractiveController';

/**
 * Base controller for dropdown windows.
 *
 * Provides open/close behavior and menu item management shared
 * by DropListController and DropMenuController.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/DropBaseController.as
 */
export class DropBaseController extends InteractiveController
{
	protected static readonly CAPTION_BLEND_CHANGE: number = 0.5;
	protected static readonly TEXT_FIELD_NAME: string = '_DROPLIST_TITLETEXT';
	protected static readonly ITEM_LIST_NAME: string = '_DROPLIST_ITEMLIST';
	protected static readonly REGION_NAME: string = '_DROPLIST_REGION';
	protected _itemArray: IWindow[] = [];
	protected _menuIsOpen: boolean = false;
	private _openUpward: boolean = false;
	private _keepOpenOnDeactivate: boolean = false;

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
		id: number = 0
	)
	{
		param = param | 0x01;
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);
	}

	protected _selection: number = -1;

	/**
	 * The current selection index.
	 */
	public get selection(): number
	{
		return this._selection;
	}

	public set selection(value: number)
	{
		if (value > this.numMenuItems - 1)
		{
			throw new Error('Menu selection index out of range!');
		}

		const selectEvent = WindowEvent.allocate('WE_SELECT', this, null, true);
		this.update(this as unknown as WindowController, selectEvent);

		if (!selectEvent.isWindowOperationPrevented())
		{
			selectEvent.recycle();
			this._selection = value;

			const selectedEvent = WindowEvent.allocate('WE_SELECTED', this, null);
			this.update(this as unknown as WindowController, selectedEvent);
			selectedEvent.recycle();
		}
		else
		{
			selectEvent.recycle();
		}
	}

	/**
	 * The number of menu items.
	 */
	public get numMenuItems(): number
	{
		return this._itemArray.length;
	}

	/**
	 * Whether the dropdown menu is currently open.
	 */
	public get opened(): boolean
	{
		return this._menuIsOpen;
	}

	public override get properties(): unknown[]
	{
		const props = super.properties;

		props.push(this.createProperty('open_upward', this._openUpward));
		props.push(this.createProperty('keep_open_on_deactivate', this._keepOpenOnDeactivate));

		return props;
	}

	public override set properties(value: unknown[])
	{
		for (const item of value)
		{
			const prop = item as PropertyStruct;

			switch (prop.key)
			{
				case 'open_upward':
					this._openUpward = prop.value as boolean;
					break;
				case 'keep_open_on_deactivate':
					this._keepOpenOnDeactivate = prop.value as boolean;
					break;
			}
		}

		super.properties = value;
	}

	/**
	 * Opens the dropdown.
	 *
	 * @returns True if the open succeeded
	 */
	public open(): boolean
	{
		if (this.getStateFlag(0))
		{
			return true;
		}

		const openEvent = WindowEvent.allocate('WE_OPEN', this, null);
		this.update(this as unknown as WindowController, openEvent);

		if (openEvent.isDefaultPrevented())
		{
			openEvent.recycle();
			return false;
		}

		openEvent.recycle();
		this.visible = true;

		const openedEvent = WindowEvent.allocate('WE_OPENED', this, null);
		this.update(this as unknown as WindowController, openedEvent);
		openedEvent.recycle();

		return true;
	}

	/**
	 * Closes the dropdown.
	 *
	 * @returns True if the close succeeded
	 */
	public close(): boolean
	{
		if (!this.getStateFlag(0))
		{
			return true;
		}

		const closeEvent = WindowEvent.allocate('WE_CLOSE', this, null);
		this.update(this as unknown as WindowController, closeEvent);

		if (closeEvent.isDefaultPrevented())
		{
			closeEvent.recycle();
			return false;
		}

		closeEvent.recycle();
		this.visible = false;

		const closedEvent = WindowEvent.allocate('WE_CLOSED', this, null);
		this.update(this as unknown as WindowController, closedEvent);
		closedEvent.recycle();

		return true;
	}

	public override update(source: WindowController, event: WindowEvent): boolean
	{
		switch (event.type)
		{
			case 'WME_DOWN':
				if (this._menuIsOpen)
				{
					if (this._keepOpenOnDeactivate)
					{
						this._menuIsOpen = false;
					}
				}
				else
				{
					this._menuIsOpen = true;
				}
				break;
			case 'WE_ENABLED':
				try
				{
					const region = this.getChildByName('_DROPLIST_REGION');
					const titleText = this.getChildByName('_DROPLIST_TITLETEXT');

					if (region) region.visible = true;
					if (titleText) titleText.blend = titleText.blend + 0.5;
				}
				catch (_e)
				{
					// ignore
				}
				break;
			case 'WE_DISABLED':
				try
				{
					const regionD = this.getChildByName('_DROPLIST_REGION');
					const titleTextD = this.getChildByName('_DROPLIST_TITLETEXT');

					if (regionD) regionD.visible = false;
					if (titleTextD) titleTextD.blend = titleTextD.blend - 0.5;
				}
				catch (_e)
				{
					// ignore
				}
				break;
		}

		return super.update(source, event);
	}

	public override dispose(): void
	{
		if (this._disposed) return;

		for (const item of this._itemArray)
		{
			item.dispose();
		}

		this._itemArray = [];

		super.dispose();
	}
}
