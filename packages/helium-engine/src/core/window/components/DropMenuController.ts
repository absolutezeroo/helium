import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IDropMenuWindow} from './IDropMenuWindow';
import {WindowEvent} from '../events/WindowEvent';
import {PropertyStruct} from '../utils/PropertyStruct';
import {DropBaseController} from './DropBaseController';

/**
 * Controller for drop menu windows.
 *
 * Manages a string-based dropdown menu where items are represented
 * as strings rather than IWindow instances.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/DropMenuController.as
 */
export class DropMenuController extends DropBaseController implements IDropMenuWindow
{
	private static readonly DROP_MENU_ITEM_MAX_LENGTH: number = 200;

	private _stringArray: string[] = [];

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
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);
	}

	public override get numMenuItems(): number
	{
		return this._stringArray.length;
	}

	public override get properties(): unknown[]
	{
		const props = super.properties;

		props.push(this.createProperty('item_array', this._stringArray));

		return props;
	}

	public override set properties(value: unknown[])
	{
		for (const item of value)
		{
			const prop = item as PropertyStruct;

			switch (prop.key)
			{
				case 'item_array':
					this.populate(prop.value as unknown[]);
					break;
			}
		}

		super.properties = value;
	}

	/**
	 * Populates the menu with an array of items.
	 */
	public populate(items: unknown[]): void
	{
		this._selection = -1;
		this._stringArray.length = 0;

		for (let i = 0; i < items.length; i++)
		{
			this._stringArray.push(String(items[i]));
		}

		this._menuIsOpen = true;
	}

	/**
	 * Populates the menu with a string array.
	 */
	public populateWithStrings(items: string[]): void
	{
		this._selection = -1;
		this._stringArray.length = 0;

		for (let i = 0; i < items.length; i++)
		{
			this._stringArray.push(items[i]);
		}

		this._menuIsOpen = true;
	}

	/**
	 * Returns the current selection items as a string array.
	 */
	public enumerateSelection(): string[]
	{
		const result: string[] = [];

		if (!this._disposed)
		{
			for (let i = 0; i < this._stringArray.length; i++)
			{
				result.push(this._stringArray[i]);
			}
		}

		return result;
	}

	public override dispose(): void
	{
		if (this._disposed) return;

		this._stringArray = [];

		super.dispose();
	}
}
