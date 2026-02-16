import type {IWindow} from '../IWindow';

/**
 * Processes mouse events for the window system.
 *
 * In AS3 this was a complex class that performed hit-testing against
 * the desktop window tree, dispatched WindowMouseEvents, managed
 * hover/focus state, and delegated to IInputEventTrackers. In TypeScript,
 * actual mouse handling is done by the SolidJS client; this class provides
 * the engine-side processing logic and state tracking.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/MouseEventProcessor.as
 */
export class MouseEventProcessor
{
	private static _cursorByState: number[] = [2, 0, 2, 2, 2, 0, 2];
	private static _stateFlags: number[] = [1, 2, 4, 64, 8, 16, 32];

	private _focused: IWindow | null = null;

	/**
	 * The currently focused window under the mouse.
	 */
	public get focused(): IWindow | null
	{
		return this._focused;
	}

	public set focused(value: IWindow | null)
	{
		this._focused = value;
	}

	private _lastClickTarget: IWindow | null = null;

	/**
	 * The last window that received a mouseDown event.
	 */
	public get lastClickTarget(): IWindow | null
	{
		return this._lastClickTarget;
	}

	public set lastClickTarget(value: IWindow | null)
	{
		this._lastClickTarget = value;
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _absMouseX: number = -1;

	/**
	 * The current absolute mouse X position.
	 */
	public get absMouseX(): number
	{
		return this._absMouseX;
	}

	private _absMouseY: number = -1;

	/**
	 * The current absolute mouse Y position.
	 */
	public get absMouseY(): number
	{
		return this._absMouseY;
	}

	/**
	 * Sets the mouse cursor type to use for a given window state flag.
	 *
	 * @param stateFlag - The window state flag
	 * @param cursorType - The cursor type to assign
	 */
	public static setMouseCursorByState(stateFlag: number, cursorType: number): void
	{
		const index = MouseEventProcessor._stateFlags.indexOf(stateFlag);

		if (index > -1)
		{
			MouseEventProcessor._cursorByState[index] = cursorType;
		}
	}

	/**
	 * Returns the mouse cursor type for a combined window state.
	 *
	 * @param state - The combined window state flags
	 * @returns The cursor type
	 */
	public static getMouseCursorByState(state: number): number
	{
		let i = MouseEventProcessor._stateFlags.length;

		while (i-- > 0)
		{
			if ((state & MouseEventProcessor._stateFlags[i]) > 0)
			{
				return MouseEventProcessor._cursorByState[i];
			}
		}

		return 0;
	}

	/**
	 * Updates the absolute mouse position.
	 *
	 * @param x - Mouse X
	 * @param y - Mouse Y
	 */
	public updateMousePosition(x: number, y: number): void
	{
		this._absMouseX = x;
		this._absMouseY = y;
	}

	/**
	 * Processes a mouse event on the given window.
	 *
	 * @param type - The mouse event type string
	 * @param x - Local X position
	 * @param y - Local Y position
	 * @param window - The target window
	 */
	public processMouseEvent(type: string, x: number, y: number, window: IWindow): void
	{
		this._absMouseX = x;
		this._absMouseY = y;

		switch (type)
		{
			case 'mousedown':
				this._lastClickTarget = window;
				break;
			case 'click':
			case 'dblclick':
				if (this._lastClickTarget !== window)
				{
					return;
				}

				this._lastClickTarget = null;
				break;
			case 'mousemove':
				if (this._focused !== window)
				{
					this._focused = window;
				}
				break;
		}
	}

	public dispose(): void
	{
		if (!this._disposed)
		{
			this._disposed = true;
			this._focused = null;
			this._lastClickTarget = null;
		}
	}
}
