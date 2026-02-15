import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import { WindowController } from '../WindowController';
import { WindowEvent } from '../events/WindowEvent';
import { PropertyStruct } from '../utils/PropertyStruct';

/**
 * Base controller for text-displaying windows.
 *
 * Stores text content and color. Serves as the base class for
 * TextLabelController, TextFieldController, and TextLinkController.
 *
 * @see sources/win63_version/core/window/components/TextController.as
 */
export class TextController extends WindowController
{
    private static readonly _propertySetters: Record<string, (ctrl: TextController, value: unknown) => void> = TextController.createPropertySetterTable();

    protected _text: string = '';
    protected _textColor: number = 0x000000;
    protected _bold: boolean = false;
    protected _italic: boolean = false;
    protected _underline: boolean = false;
    protected _fontFace: string = '';
    protected _fontSize: number = 12;
    protected _multiline: boolean = false;
    protected _wordWrap: boolean = false;
    protected _maxChars: number = 0;
    protected _maxLines: number = 0;
    protected _overflowReplace: string = '';
    protected _autoSize: string = 'none';
    protected _textStyleName: string = '';
    protected _marginLeft: number = 0;
    protected _marginTop: number = 0;
    protected _marginRight: number = 0;
    protected _marginBottom: number = 0;
    protected _spacing: number = 0;
    protected _leading: number = 0;
    protected _drawing: boolean = false;

    /**
     * Creates the property setter lookup table.
     */
    protected static createPropertySetterTable(): Record<string, (ctrl: TextController, value: unknown) => void>
    {
        return {
            'bold': (ctrl, v) => { ctrl._bold = !!v; },
            'italic': (ctrl, v) => { ctrl._italic = !!v; },
            'underline': (ctrl, v) => { ctrl._underline = !!v; },
            'font_face': (ctrl, v) => { ctrl._fontFace = v as string; },
            'font_size': (ctrl, v) => { ctrl._fontSize = v as number; },
            'text_color': (ctrl, v) => { ctrl._textColor = v as number; },
            'text_style': (ctrl, v) => { ctrl._textStyleName = v as string; },
            'multiline': (ctrl, v) => { ctrl._multiline = !!v; },
            'word_wrap': (ctrl, v) => { ctrl._wordWrap = !!v; },
            'max_chars': (ctrl, v) => { ctrl._maxChars = v as number; },
            'max_lines': (ctrl, v) => { ctrl._maxLines = v as number; },
            'overflow_replace': (ctrl, v) => { ctrl._overflowReplace = v as string; },
            'auto_size': (ctrl, v) => { ctrl._autoSize = v as string; },
            'spacing': (ctrl, v) => { ctrl._spacing = v as number; },
            'leading': (ctrl, v) => { ctrl._leading = v as number; },
            'margin_left': (ctrl, v) => { ctrl._marginLeft = v as number; },
            'margin_top': (ctrl, v) => { ctrl._marginTop = v as number; },
            'margin_right': (ctrl, v) => { ctrl._marginRight = v as number; },
            'margin_bottom': (ctrl, v) => { ctrl._marginBottom = v as number; },
        };
    }

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
        this._text = value ?? '';
    }

    public get textColor(): number
    {
        return this._textColor;
    }

    public set textColor(value: number)
    {
        this._textColor = value;
    }

    public get bold(): boolean
    {
        return this._bold;
    }

    public get italic(): boolean
    {
        return this._italic;
    }

    public get underline(): boolean
    {
        return this._underline;
    }

    public get fontFace(): string
    {
        return this._fontFace;
    }

    public get fontSize(): number
    {
        return this._fontSize;
    }

    public get multiline(): boolean
    {
        return this._multiline;
    }

    public set multiline(value: boolean)
    {
        this._multiline = value;
    }

    public get wordWrap(): boolean
    {
        return this._wordWrap;
    }

    public set wordWrap(value: boolean)
    {
        this._wordWrap = value;
    }

    public get autoSize(): string
    {
        return this._autoSize;
    }

    public set autoSize(value: string)
    {
        this._autoSize = value;
    }

    public get maxChars(): number
    {
        return this._maxChars;
    }

    public set maxChars(value: number)
    {
        this._maxChars = value;
    }

    public get maxLines(): number
    {
        return this._maxLines;
    }

    public set maxLines(value: number)
    {
        this._maxLines = value;
    }

    public get overflowReplace(): string
    {
        return this._overflowReplace;
    }

    public set overflowReplace(value: string)
    {
        this._overflowReplace = value;
    }

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

        for(const item of value)
        {
            const prop = item as PropertyStruct;
            const setter = TextController._propertySetters[prop.key];

            if(setter)
            {
                setter(this, prop.value);
            }
        }

        this._drawing = false;
        super.properties = value;
    }
}
