import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IBubbleWindow} from './IBubbleWindow';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {PropertyStruct} from '../utils/PropertyStruct';
import {FrameController} from './FrameController';

/**
 * Controller for bubble windows with directional pointers.
 *
 * Extends FrameController with pointer elements (up, down, left, right)
 * that can be positioned relative to the bubble. Used for speech bubbles,
 * tooltips with arrows, etc.
 *
 * @see sources/win63_version/com/sulake/core/window/components/BubbleController.as
 */
export class BubbleController extends FrameController implements IBubbleWindow
{
	private static readonly TAG_POINTER_UP_ELEMENT: string = '_POINTER_UP';
	private static readonly TAG_POINTER_DOWN_ELEMENT: string = '_POINTER_DOWN';
	private static readonly TAG_POINTER_LEFT_ELEMENT: string = '_POINTER_LEFT';
	private static readonly TAG_POINTER_RIGHT_ELEMENT: string = '_POINTER_RIGHT';

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

	private _direction: string = 'down';

	/**
	 * The pointer direction ('up', 'down', 'left', 'right').
	 */
	public get direction(): string
	{
		return this._direction;
	}

	public set direction(value: string)
	{
		if (value !== this._direction)
		{
			const newPointer = this.getChildByName(value);

			if (!newPointer)
			{
				throw new Error('Invalid pointer direction: "' + value + '"!');
			}

			const oldPointer = this.getChildByName(this._direction);

			if (oldPointer)
			{
				oldPointer.visible = false;
			}

			newPointer.visible = true;
			this._direction = value;
			this.pointerOffset = this._pointerOffset;
		}
	}

	private _pointerOffset: number = 0;

	/**
	 * The offset of the pointer from the center.
	 */
	public get pointerOffset(): number
	{
		return this._pointerOffset;
	}

	public set pointerOffset(value: number)
	{
		const pointer = this.getChildByName(this._direction);

		if (!pointer)
		{
			throw new Error('Invalid pointer direction: "' + this._direction + '"!');
		}

		if (this._direction === 'up' || this._direction === 'down')
		{
			pointer.x = (this.width / 2) + value;
		}
		else
		{
			pointer.y = (this.height / 2) + value;
		}

		this._pointerOffset = value;
	}

	public override get properties(): unknown[]
	{
		const props = super.properties;

		props.push(this.createProperty('direction', this._direction));
		props.push(this.createProperty('pointer_offset', this._pointerOffset));

		return props;
	}

	public override set properties(value: unknown[])
	{
		for (const item of value)
		{
			const prop = item as PropertyStruct;

			switch (prop.key)
			{
				case 'direction':
					this.direction = prop.value as string;
					break;
				case 'pointer_offset':
					this.pointerOffset = prop.value as number;
					break;
			}
		}

		super.properties = value;
	}

	public override update(source: WindowController, event: WindowEvent): boolean
	{
		const result = super.update(source, event);

		if (this._pointerOffset !== 0)
		{
			if (source === (this as unknown))
			{
				if (event.type === 'WE_RESIZED')
				{
					this.pointerOffset = this._pointerOffset;
				}
			}
		}

		return result;
	}
}
