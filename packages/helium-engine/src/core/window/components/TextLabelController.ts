import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {ILabelWindow} from './ILabelWindow';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {PropertyStruct} from '../utils/PropertyStruct';

/**
 * Controller for label windows.
 *
 * A lightweight text display that uses shared TextFieldCache instances
 * rather than owning a dedicated TextField. Unlike TextController,
 * this extends WindowController directly per AS3.
 *
 * @see sources/win63_version/core/window/components/TextLabelController.as
 */
export class TextLabelController extends WindowController implements ILabelWindow
{
	private _textStyleName: string = '';
	private _text: string = '';
	private _textColor: number | null = null;
	private _textWidth: number = 0;
	private _textHeight: number = 0;
	private _refreshing: boolean = false;
	private _vertical: boolean = false;
	private _marginLeft: number = 0;
	private _marginTop: number = 0;
	private _marginRight: number = 0;
	private _marginBottom: number = 0;

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
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);

		this._hasVisualContent = true;
	}

	public get text(): string
	{
		return this._text;
	}

	public set text(value: string)
	{
		if(value == null) return;

		this._caption = value;
		this._text = value;
		this.refresh();
	}

	public override get caption(): string
	{
		return this._text;
	}

	public override set caption(value: string)
	{
		this.text = value;
	}

	public get textColor(): number
	{
		return this._textColor ?? 0;
	}

	public set textColor(value: number)
	{
		if(value !== this._textColor)
		{
			this._textColor = value;
			this.refresh();
		}
	}

	/**
	 * Whether a text color has been explicitly set.
	 */
	public get hasTextColor(): boolean
	{
		return this._textColor !== null;
	}

	public get textBackground(): boolean
	{
		return this.background;
	}

	public set textBackground(value: boolean)
	{
		this.background = value;
	}

	public get textBackgroundColor(): number
	{
		return this.color;
	}

	public set textBackgroundColor(value: number)
	{
		this.color = value;
	}

	public get vertical(): boolean
	{
		return this._vertical;
	}

	public set vertical(value: boolean)
	{
		this._vertical = value;
		this.refresh();
	}

	public get bold(): boolean
	{
		return false;
	}

	public get italic(): boolean
	{
		return false;
	}

	public get underline(): boolean
	{
		return false;
	}

	public get fontFace(): string
	{
		return '';
	}

	public get fontSize(): number
	{
		return 12;
	}

	public get length(): number
	{
		return this._text.length;
	}

	public get textHeight(): number
	{
		return this._textHeight;
	}

	public get textWidth(): number
	{
		return this._textWidth;
	}

	/**
	 * Draw offset X (margin left).
	 */
	public get drawOffsetX(): number
	{
		return this._marginLeft;
	}

	/**
	 * Draw offset Y (margin top).
	 */
	public get drawOffsetY(): number
	{
		return this._marginTop;
	}

	public override get properties(): unknown[]
	{
		const props = super.properties;

		props.push(this.createProperty('text_style', this._textStyleName));
		props.push(this.createProperty('text_color', this._textColor ?? 0));
		props.push(this.createProperty('vertical', this._vertical));
		props.push(this.createProperty('margin_left', this._marginLeft));
		props.push(this.createProperty('margin_top', this._marginTop));
		props.push(this.createProperty('margin_right', this._marginRight));
		props.push(this.createProperty('margin_bottom', this._marginBottom));

		return props;
	}

	public override set properties(value: unknown[])
	{
		for(const item of value)
		{
			const prop = item as PropertyStruct;

			switch(prop.key)
			{
				case 'text_style':
					this._textStyleName = prop.value as string;
					break;
				case 'text_color':
					this._textColor = prop.value as number;
					break;
				case 'margin_left':
					this._marginLeft = prop.value as number;
					break;
				case 'margin_top':
					this._marginTop = prop.value as number;
					break;
				case 'margin_right':
					this._marginRight = prop.value as number;
					break;
				case 'margin_bottom':
					this._marginBottom = prop.value as number;
					break;
				case 'vertical':
					this._vertical = !!prop.value;
					break;
			}
		}

		super.properties = value;
	}

	/**
	 * Refreshes text layout, recalculating dimensions and invalidating.
	 *
	 * In AS3, this uses TextFieldCache to get a shared TextField,
	 * measures the text, then auto-sizes the window. Here we
	 * estimate and let the renderer handle final layout.
	 */
	private refresh(_fromResize: boolean = false): void
	{
		if(this._refreshing) return;

		this._refreshing = true;

		// Estimate text dimensions (actual measurement deferred to renderer)
		this._textWidth = this._width;
		this._textHeight = this._height;

		this._refreshing = false;
		this._context.invalidate(this, null, 1);
	}

	public override dispose(): void
	{
		if(this._disposed) return;

		super.dispose();
	}
}
