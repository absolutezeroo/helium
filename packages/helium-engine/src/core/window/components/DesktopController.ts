import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IDesktopWindow} from './IDesktopWindow';
import {ContainerController} from './ContainerController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Desktop controller — the root container for all windows in a context.
 *
 * Manages the active window, provides mouse position tracking,
 * and handles parameter-filtered child lookups.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/DesktopController.as
 */
export class DesktopController extends ContainerController implements IDesktopWindow
{
	private _activeWindow: IWindow | null = null;

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

	private _mouseX: number = 0;

	public get mouseX(): number
	{
		return this._mouseX;
	}

	private _mouseY: number = 0;

	public get mouseY(): number
	{
		return this._mouseY;
	}

	public getActiveWindow(): IWindow
	{
		return this._activeWindow ?? this;
	}

	public setActiveWindow(window: IWindow): IWindow
	{
		const previous = this._activeWindow;

		this._activeWindow = window;

		return previous ?? this;
	}

	public groupParameterFilteredChildrenUnderPoint(
		point: { x: number; y: number },
		result: IWindow[],
		paramFilter: number = 0
	): void
	{
		for (let i = this.numChildren - 1; i >= 0; i--)
		{
			const child = this.getChildAt(i);

			if (child && child.visible && child.hitTestLocalPoint(point))
			{
				if (paramFilter === 0 || child.testParamFlag(paramFilter))
				{
					result.push(child);
				}
			}
		}
	}

	public setDisplayObject(displayObject: unknown): void
	{
		// No-op in TypeScript port — rendering handled by client layer
	}

	public getDisplayObject(): unknown
	{
		return null;
	}

	public override dispose(): void
	{
		if (this._disposed) return;

		this._activeWindow = null;

		super.dispose();
	}
}
