import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {ITextWindow} from './ITextWindow';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {PropertyStruct} from '../utils/PropertyStruct';
import {TextStyleManager} from '../utils/TextStyleManager';
import {resolveLocalizationTokens} from '../utils/WindowParser';

/**
 * Base controller for text-displaying windows.
 *
 * Stores text content and color. Serves as the base class for
 * TextFieldController, TextLinkController, and FormattedTextController.
 *
 * In AS3, this wraps a native Flash TextField. In TypeScript, we store
 * text properties as pure data; the rendering layer handles display.
 *
 * @see sources/win63_version/core/window/components/TextController.as
 */
export class TextController extends WindowController implements ITextWindow
{
	private static readonly _propertySetters: Record<string, (ctrl: TextController, value: unknown) => void> = TextController.createPropertySetterTable();
	protected _textStyleName: string = '';
	protected _marginLeft: number = 0;
	protected _marginTop: number = 0;
	protected _marginRight: number = 0;
	protected _marginBottom: number = 0;
	protected _spacing: number = 0;
	protected _leading: number = 0;
	protected _drawing: boolean = false;

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

	protected _text: string = '';

	public get text(): string
	{
		return this._text;
	}

	/**
	 * Sets the text content and syncs with the parent caption field.
	 *
	 * In AS3, `set text` stored to `_caption`, checked for `${key}` localization
	 * tokens, and updated the native TextField. Here we resolve tokens immediately
	 * and sync `_text` and `_caption`.
	 *
	 * @see sources/win63_2021_version/com/sulake/core/window/components/TextController.as set text()
	 */
	public set text(value: string)
	{
		if (value == null) return;

		this._text = resolveLocalizationTokens(value);
		this._caption = this._text;
		this._context.invalidate(this, null, 1);
	}

	/**
	 * In AS3, `set caption` delegates to `set text`, syncing both properties.
	 * The caption IS the text content for text-type windows.
	 *
	 * @see sources/win63_2021_version/com/sulake/core/window/components/TextController.as set caption()
	 */
	public override get caption(): string
	{
		return this._text;
	}

	public override set caption(value: string)
	{
		this.text = value;
	}

	protected _textColor: number = 0x000000;

	public get textColor(): number
	{
		return this._textColor;
	}

	public set textColor(value: number)
	{
		this._textColor = value;
		this._context.invalidate(this, null, 1);
	}

	protected _bold: boolean = false;

	public get bold(): boolean
	{
		return this._bold;
	}

	public set bold(value: boolean)
	{
		this._bold = value;
		this.refreshTextImage();
	}

	protected _italic: boolean = false;

	public get italic(): boolean
	{
		return this._italic;
	}

	public set italic(value: boolean)
	{
		this._italic = value;
		this.refreshTextImage();
	}

	protected _underline: boolean = false;

	public get underline(): boolean
	{
		return this._underline;
	}

	public set underline(value: boolean)
	{
		this._underline = value;
		this.refreshTextImage();
	}

	protected _fontFace: string = '';

	public get fontFace(): string
	{
		return this._fontFace;
	}

	public set fontFace(value: string)
	{
		this._fontFace = value;
		this.refreshTextImage();
	}

	protected _fontSize: number = 12;

	public get fontSize(): number
	{
		return this._fontSize;
	}

	public set fontSize(value: number)
	{
		this._fontSize = value;
		this.refreshTextImage();
	}

	protected _etchingColor: number = 0;

	public get etchingColor(): number
	{
		return this._etchingColor;
	}

	public set etchingColor(value: number)
	{
		this._etchingColor = value;
		this.refreshTextImage();
	}

	protected _etchingPosition: string = 'bottom';

	public get etchingPosition(): string
	{
		return this._etchingPosition;
	}

	public set etchingPosition(value: string)
	{
		this._etchingPosition = value;
		this.refreshTextImage();
	}

	protected _multiline: boolean = false;

	public get multiline(): boolean
	{
		return this._multiline;
	}

	public set multiline(value: boolean)
	{
		this._multiline = value;
		this.refreshTextImage();
	}

	protected _wordWrap: boolean = false;

	public get wordWrap(): boolean
	{
		return this._wordWrap;
	}

	public set wordWrap(value: boolean)
	{
		this._wordWrap = value;
		this.refreshTextImage();
	}

	protected _maxChars: number = 0;

	public get maxChars(): number
	{
		return this._maxChars;
	}

	public set maxChars(value: number)
	{
		this._maxChars = value;
		this.refreshTextImage();
	}

	protected _maxLines: number = 0;

	public get maxLines(): number
	{
		return this._maxLines;
	}

	public set maxLines(value: number)
	{
		this._maxLines = value;
		this.refreshTextImage();
	}

	protected _overflowReplace: string = '';

	public get overflowReplace(): string
	{
		return this._overflowReplace;
	}

	public set overflowReplace(value: string)
	{
		this._overflowReplace = value;
		this.refreshTextImage();
	}

	public get isOverflowReplaceOn(): boolean
	{
		return this._overflowReplace !== '';
	}

	protected _autoSize: string = 'none';

	public get autoSize(): string
	{
		return this._autoSize;
	}

	public set autoSize(value: string)
	{
		this._autoSize = value;
		this.refreshTextImage();
	}

	/**
	 * Text content length.
	 */
	public get length(): number
	{
		return this._text.length;
	}

	/**
	 * Number of lines in the text.
	 */
	public get numLines(): number
	{
		if (!this._text) return 1;

		return this._text.split('\n').length;
	}

	/**
	 * Text height in pixels. Stub — actual measurement requires the renderer.
	 */
	public get textHeight(): number
	{
		return this._height - this._marginTop - this._marginBottom;
	}

	/**
	 * Text width in pixels. Stub — actual measurement requires the renderer.
	 */
	public get textWidth(): number
	{
		return this._width - this._marginLeft - this._marginRight;
	}

	/**
	 * Whether the text content is using background fill.
	 */
	public get textBackground(): boolean
	{
		return this.background;
	}

	public set textBackground(value: boolean)
	{
		this.background = value;
	}

	/**
	 * Background fill color for text area.
	 */
	public get textBackgroundColor(): number
	{
		return this.color;
	}

	public set textBackgroundColor(value: number)
	{
		this.color = value;
	}

	// ── Scroll stubs ────────────────────────────────────────────────

	protected _scrollH: number = 0;

	public get scrollH(): number
	{
		return this._scrollH;
	}

	public set scrollH(value: number)
	{
		this._scrollH = value;
		this.refreshTextImage();
	}

	protected _scrollV: number = 0;

	public get scrollV(): number
	{
		return this._scrollV;
	}

	public set scrollV(value: number)
	{
		this._scrollV = value;
		this.refreshTextImage();
	}

	public get maxScrollH(): number
	{
		return 0;
	}

	public get maxScrollV(): number
	{
		return Math.max(this.textHeight - this._height, 0);
	}

	public get scrollStepH(): number
	{
		return 10;
	}

	public set scrollStepH(_value: number)
	{
		// No-op per AS3
	}

	public get scrollStepV(): number
	{
		const lines = this.numLines;

		return lines > 0 ? this.textHeight / lines : 10;
	}

	public set scrollStepV(_value: number)
	{
		// No-op per AS3
	}

	public get visibleRegion(): { x: number; y: number; width: number; height: number }
	{
		return {
			x: this._scrollH * this.maxScrollH,
			y: this._scrollV * this.maxScrollV,
			width: this._width,
			height: this._height
		};
	}

	public get scrollableRegion(): { x: number; y: number; width: number; height: number }
	{
		return {
			x: 0,
			y: 0,
			width: this.maxScrollH + this._width,
			height: this.maxScrollV + this._height
		};
	}

	// ── Methods ─────────────────────────────────────────────────────

	public override get properties(): unknown[]
	{
		const props = super.properties;

		props.push(this.createProperty('bold', this._bold));
		props.push(this.createProperty('italic', this._italic));
		props.push(this.createProperty('underline', this._underline));
		props.push(this.createProperty('font_face', this._fontFace));
		props.push(this.createProperty('font_size', this._fontSize));
		props.push(this.createProperty('text_color', this._textColor));
		props.push(this.createProperty('text_style', this._textStyleName));
		props.push(this.createProperty('etching_color', this._etchingColor));
		props.push(this.createProperty('etching_position', this._etchingPosition));
		props.push(this.createProperty('auto_size', this._autoSize));
		props.push(this.createProperty('multiline', this._multiline));
		props.push(this.createProperty('word_wrap', this._wordWrap));
		props.push(this.createProperty('max_chars', this._maxChars));
		props.push(this.createProperty('max_lines', this._maxLines));
		props.push(this.createProperty('overflow_replace', this._overflowReplace));
		props.push(this.createProperty('margin_left', this._marginLeft));
		props.push(this.createProperty('margin_top', this._marginTop));
		props.push(this.createProperty('margin_right', this._marginRight));
		props.push(this.createProperty('margin_bottom', this._marginBottom));
		props.push(this.createProperty('spacing', this._spacing));
		props.push(this.createProperty('leading', this._leading));

		return props;
	}

	public override set properties(value: unknown[])
	{
		this._drawing = true;

		for (const item of value)
		{
			const prop = item as PropertyStruct;
			const setter = TextController._propertySetters[prop.key];

			if (setter)
			{
				setter(this, prop.value);
			}
		}

		this._drawing = false;
		super.properties = value;
		this.refreshTextImage();
	}

	/**
	 * Creates the property setter lookup table.
	 */
	protected static createPropertySetterTable(): Record<string, (ctrl: TextController, value: unknown) => void>
	{
		return {
			'bold': (ctrl, v) =>
			{
				ctrl._bold = !!v;
			},
			'italic': (ctrl, v) =>
			{
				ctrl._italic = !!v;
			},
			'underline': (ctrl, v) =>
			{
				ctrl._underline = !!v;
			},
			'font_face': (ctrl, v) =>
			{
				ctrl._fontFace = v as string;
			},
			'font_size': (ctrl, v) =>
			{
				ctrl._fontSize = v as number;
			},
			'text_color': (ctrl, v) =>
			{
				ctrl._textColor = v as number;
			},
			'text_style': (ctrl, v) =>
			{
				ctrl._textStyleName = v as string;

				const resolved = TextStyleManager.getStyle(ctrl._textStyleName);

				if (resolved)
				{
					if (resolved.fontFamily != null) ctrl._fontFace = resolved.fontFamily;
					if (resolved.fontSize != null) ctrl._fontSize = resolved.fontSize;
					if (resolved.fontWeight === 'bold') ctrl._bold = true;
					if (resolved.fontStyle === 'italic') ctrl._italic = true;
					if (resolved.textDecoration === 'underline') ctrl._underline = true;
					if (resolved.color != null) ctrl._textColor = resolved.color;
					if (resolved.etchingColor != null) ctrl._etchingColor = resolved.etchingColor;
					if (resolved.etchingPosition != null) ctrl._etchingPosition = resolved.etchingPosition;
				}
			},
			'etching_color': (ctrl, v) =>
			{
				ctrl._etchingColor = v as number;
			},
			'etching_position': (ctrl, v) =>
			{
				ctrl._etchingPosition = v as string;
			},
			'background': (ctrl, v) =>
			{
				ctrl.background = !!v;
			},
			'background_color': (ctrl, v) =>
			{
				ctrl.color = v as number;
			},
			'multiline': (ctrl, v) =>
			{
				ctrl._multiline = !!v;
			},
			'word_wrap': (ctrl, v) =>
			{
				ctrl._wordWrap = !!v;
			},
			'max_chars': (ctrl, v) =>
			{
				ctrl._maxChars = v as number;
			},
			'max_lines': (ctrl, v) =>
			{
				ctrl._maxLines = v as number;
			},
			'overflow_replace': (ctrl, v) =>
			{
				ctrl._overflowReplace = v as string;
			},
			'auto_size': (ctrl, v) =>
			{
				ctrl._autoSize = v as string;
			},
			'spacing': (ctrl, v) =>
			{
				ctrl._spacing = v as number;
			},
			'leading': (ctrl, v) =>
			{
				ctrl._leading = v as number;
			},
			'margin_left': (ctrl, v) =>
			{
				ctrl._marginLeft = v as number;
			},
			'margin_top': (ctrl, v) =>
			{
				ctrl._marginTop = v as number;
			},
			'margin_right': (ctrl, v) =>
			{
				ctrl._marginRight = v as number;
			},
			'margin_bottom': (ctrl, v) =>
			{
				ctrl._marginBottom = v as number;
			},
		};
	}

	/**
	 * Appends text to the current content.
	 */
	public appendText(value: string): void
	{
		this._text += value;
		this._caption = this._text;
		this.refreshTextImage();
	}

	/**
	 * Replaces a range of text content.
	 */
	public replaceText(beginIndex: number, endIndex: number, newText: string): void
	{
		this._text = this._text.substring(0, beginIndex) + newText + this._text.substring(endIndex);
		this._caption = this._text;
		this.refreshTextImage();
	}

	/**
	 * Handles WE_RESIZED to refresh text layout.
	 */
	public override update(source: WindowController, event: WindowEvent): boolean
	{
		if (!this._drawing)
		{
			if (event.type === 'WE_RESIZED')
			{
				this.refreshTextImage(true);
			}
		}

		return super.update(source, event);
	}

	/**
	 * Limits a string to maxChars length.
	 */
	protected limitStringLength(value: string): string
	{
		return this._maxChars > 0 ? value.substring(0, this._maxChars) : value;
	}

	/**
	 * Refreshes text image / invalidates rendering.
	 *
	 * In AS3, this recalculates text field dimensions, handles overflow
	 * replace, and auto-sizing. Here we invalidate for the renderer.
	 */
	protected refreshTextImage(_fromResize: boolean = false): void
	{
		if (this._drawing) return;

		this._context.invalidate(this, null, 1);
	}
}
