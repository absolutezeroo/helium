import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IDisplayObjectWrapper} from './IDisplayObjectWrapper';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for display object wrapper windows.
 *
 * Wraps an external display object (rendered by the client layer)
 * for embedding within the window system. In the TypeScript port,
 * display objects are represented as `unknown`.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/DisplayObjectWrapperController.as
 */
export class DisplayObjectWrapperController extends WindowController implements IDisplayObjectWrapper
{
	private _displayObject: unknown = null;

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
		param = param & (~0x10);
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);

		this._hasVisualContent = false;
	}

	/**
	 * Returns the wrapped display object.
	 */
	public getDisplayObject(): unknown
	{
		return this._displayObject;
	}

	/**
	 * Sets the wrapped display object.
	 */
	public setDisplayObject(displayObject: unknown): void
	{
		this._displayObject = displayObject;
	}
}
