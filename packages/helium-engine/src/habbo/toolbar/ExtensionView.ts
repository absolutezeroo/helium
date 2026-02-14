import type {IExtensionView} from './IExtensionView';
import type {HabboToolbar} from './HabboToolbar';
import {ExtensionViewEvent} from './events/ExtensionViewEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('ExtensionView');

/**
 * Container for toolbar extensions (purse, settings, promos, etc.)
 *
 * Manages a list of extension panels that can be attached/detached from the
 * toolbar area. In AS3, this uses an IItemListWindow for layout. In Helium,
 * the actual rendering is handled by SolidJS; this class manages the
 * extension state and ordering.
 *
 * @see sources/win63_version/habbo/toolbar/ExtensionView.as
 */
export class ExtensionView implements IExtensionView
{
	private static readonly MARGIN: number = 3;
	private static readonly PURSE_EXTENSION_OFFSET: number = -8;

	private _toolbar: HabboToolbar | null;
	private _items: Map<string, unknown> = new Map();
	private _disposed: boolean = false;
	private _landingView: boolean = false;
	private _orderedItems: Array<{ id: string; element: unknown }> = [];
	private _extraMargin: number = 0;
	private _visible: boolean = true;

	constructor(toolbar: HabboToolbar)
	{
		this._toolbar = toolbar;

		log.debug('ExtensionView constructed');
	}

	/**
	 * Whether the extension view is visible
	 */
	get visible(): boolean
	{
		return this._visible;
	}

	set visible(value: boolean)
	{
		this._visible = value;
	}

	/**
	 * The screen height occupied by the extension view
	 */
	get screenHeight(): number
	{
		// In Helium, screen height is managed by the UI layer
		return 0;
	}

	/**
	 * Extra margin applied to the extension view
	 */
	get extraMargin(): number
	{
		return this._extraMargin;
	}

	set extraMargin(value: number)
	{
		this._extraMargin = value;
	}

	/**
	 * Whether the landing view mode is active
	 */
	get landingView(): boolean
	{
		return this._landingView;
	}

	set landingView(value: boolean)
	{
		this._landingView = value;
		this.refreshItemWindow();
	}

	/**
	 * Attach an extension panel to the view
	 *
	 * @param id Extension identifier
	 * @param element The element to attach
	 * @param index Optional insertion index (-1 for end)
	 * @param params Optional parameters for resolving insertion index
	 */
	public attachExtension(id: string, element: unknown, index: number = -1, params: unknown[] | null = null): void
	{
		if(this._disposed) return;

		if(this._items.has(id)) return;

		this._items.set(id, element);

		if(params !== null)
		{
			index = this.resolveIndex(params as string[]);
		}

		const entry = { id, element };

		if(index === -1)
		{
			this._orderedItems.push(entry);
		}
		else
		{
			this._orderedItems.splice(index, 0, entry);
		}

		this.refreshItemWindow();
		this.queueResizeEvent();
	}

	/**
	 * Detach an extension panel from the view
	 *
	 * @param id Extension identifier
	 */
	public detachExtension(id: string): void
	{
		if(this._disposed) return;

		const idx = this._orderedItems.findIndex(item => item.id === id);

		if(idx !== -1)
		{
			this._orderedItems.splice(idx, 1);
		}

		this._items.delete(id);
		this.refreshItemWindow();
		this.queueResizeEvent();
	}

	/**
	 * Check whether an extension is currently attached
	 *
	 * @param id Extension identifier
	 * @returns True if the extension is attached
	 */
	public hasExtension(id: string): boolean
	{
		return this._items.has(id);
	}

	/**
	 * Refresh the layout of the extension view
	 *
	 * In AS3, this rebuilds the IItemListWindow with the proper ordering,
	 * applying special handling for certain extension IDs like "purse".
	 * In Helium, this signals the UI layer to re-render.
	 */
	public refreshItemWindow(): void
	{
		// State is managed here; UI re-renders via reactive stores
		log.debug(`ExtensionView refreshed with ${this._orderedItems.length} items`);
	}

	/**
	 * Get the icon location for extension-hosted icons
	 *
	 * @param iconId Icon identifier
	 * @returns Rectangle or null
	 */
	public getIconLocation(iconId: string): { x: number; y: number; width: number; height: number } | null
	{
		if(iconId === 'HTIE_EXT_GROUP')
		{
			// room_group_info extension lookup
			return null;
		}

		return null;
	}

	/**
	 * Remove all dimmer overlays from extensions
	 */
	public removeDimmers(): void
	{
		// Dimmer management is a Flash-specific concept
	}

	/**
	 * Get all ordered extension IDs
	 */
	public getOrderedExtensionIds(): string[]
	{
		return this._orderedItems.map(item => item.id);
	}

	private resolveIndex(params: string[]): number
	{
		for(let i = 0; i < this._orderedItems.length; i++)
		{
			if(params.indexOf(this._orderedItems[i].id) > -1)
			{
				return i;
			}
		}

		return -1;
	}

	private queueResizeEvent(): void
	{
		// In AS3, this used a 25ms Timer to debounce resize events.
		// In Helium, we dispatch the event directly.
		if(this._toolbar)
		{
			const event = new ExtensionViewEvent(ExtensionViewEvent.EXTENSION_VIEW_RESIZED);
			this._toolbar.toolbarEvents.emit(ExtensionViewEvent.EXTENSION_VIEW_RESIZED, event);
		}
	}

	/**
	 * Dispose of this view and all its resources
	 */
	public dispose(): void
	{
		if(this._disposed) return;

		const keys = Array.from(this._items.keys());

		for(const key of keys)
		{
			this.detachExtension(key);
		}

		this._orderedItems = [];
		this._items.clear();
		this._toolbar = null;
		this._disposed = true;
	}
}
