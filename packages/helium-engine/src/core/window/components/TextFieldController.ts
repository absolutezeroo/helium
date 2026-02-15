import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { ITextFieldWindow } from './ITextFieldWindow';
import { TextController } from './TextController';
import { InteractiveController } from './InteractiveController';
import { WindowEvent } from '../events/WindowEvent';
import { PropertyStruct } from '../utils/PropertyStruct';

/**
 * Controller for editable text field windows.
 *
 * Extends TextController with input-specific functionality:
 * editable state, selection, password display, and max length.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/TextFieldController.as
 */
export class TextFieldController extends TextController implements ITextFieldWindow
{
    private _maxLength: number = 0;
    private _editable: boolean = true;
    private _selectable: boolean = true;
    private _displayAsPassword: boolean = false;
    private _focused: boolean = false;
    private _selectionBeginIndex: number = 0;
    private _selectionEndIndex: number = 0;
    private _displayRaw: boolean = false;
    private _textBackground: boolean = false;
    private _textBackgroundColor: number = 0xFFFFFF;
    private _scrollH: number = 0;
    private _scrollV: number = 0;
    private _scrollStepH: number = 1;
    private _scrollStepV: number = 1;
    private _toolTipCaption: string = '';
    private _toolTipDelay: number = 500;
    private _toolTipIsDynamic: boolean = false;

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
    }

    // ── ITextWindow ─────────────────────────────────────────────────

    public override get bold(): boolean
    {
        return this._bold;
    }

    public override get italic(): boolean
    {
        return this._italic;
    }

    public override get underline(): boolean
    {
        return this._underline;
    }

    public override get fontFace(): string
    {
        return this._fontFace;
    }

    public override get fontSize(): number
    {
        return this._fontSize;
    }

    public get length(): number
    {
        return this._text.length;
    }

    public get numLines(): number
    {
        return 1;
    }

    public get textHeight(): number
    {
        return this._height;
    }

    public get textWidth(): number
    {
        return this._width;
    }

    public get textBackground(): boolean
    {
        return this._textBackground;
    }

    public set textBackground(value: boolean)
    {
        this._textBackground = value;
    }

    public get textBackgroundColor(): number
    {
        return this._textBackgroundColor;
    }

    public set textBackgroundColor(value: number)
    {
        this._textBackgroundColor = value;
    }

    public appendText(text: string): void
    {
        this._text += text;
    }

    public replaceText(beginIndex: number, endIndex: number, newText: string): void
    {
        this._text = this._text.substring(0, beginIndex) + newText + this._text.substring(endIndex);
    }

    // ── ITextFieldWindow ────────────────────────────────────────────

    public get editable(): boolean
    {
        return this._editable;
    }

    public set editable(value: boolean)
    {
        this._editable = value;
    }

    public get selectable(): boolean
    {
        return this._selectable;
    }

    public set selectable(value: boolean)
    {
        this._selectable = value;
    }

    public get displayAsPassword(): boolean
    {
        return this._displayAsPassword;
    }

    public set displayAsPassword(value: boolean)
    {
        this._displayAsPassword = value;
    }

    public get focused(): boolean
    {
        return this._focused;
    }

    public get selectionBeginIndex(): number
    {
        return this._selectionBeginIndex;
    }

    public get selectionEndIndex(): number
    {
        return this._selectionEndIndex;
    }

    public get displayRaw(): boolean
    {
        return this._displayRaw;
    }

    public set displayRaw(value: boolean)
    {
        this._displayRaw = value;
    }

    public setSelection(beginIndex: number, endIndex: number): void
    {
        this._selectionBeginIndex = beginIndex;
        this._selectionEndIndex = endIndex;
    }

    public requestChangeEvent(): void
    {
        // Dispatches a WE_CHANGE event — client layer handles actual input
    }

    public getWordAt(_x: number, _y: number): string
    {
        return '';
    }

    // ── Properties ──────────────────────────────────────────────────

    public override get properties(): unknown[]
    {
        const props = InteractiveController.writeInteractiveWindowProperties(this, super.properties);

        props.push(this.createProperty('editable', this._editable));
        props.push(this.createProperty('selectable', this._selectable));
        props.push(this.createProperty('display_as_password', this._displayAsPassword));
        props.push(this.createProperty('display_raw', this._displayRaw));

        return props;
    }

    public override set properties(value: unknown[])
    {
        InteractiveController.readInteractiveWindowProperties(this, value);

        for(const item of value)
        {
            const prop = item as PropertyStruct;

            switch(prop.key)
            {
                case 'editable':
                    this._editable = !!prop.value;
                    break;
                case 'selectable':
                    this._selectable = !!prop.value;
                    break;
                case 'display_as_password':
                    this._displayAsPassword = !!prop.value;
                    break;
                case 'display_raw':
                    this._displayRaw = !!prop.value;
                    break;
            }
        }

        super.properties = value;
    }

    // ── IScrollableWindow ───────────────────────────────────────────

    public get scrollH(): number
    {
        return this._scrollH;
    }

    public set scrollH(value: number)
    {
        this._scrollH = value;
    }

    public get scrollV(): number
    {
        return this._scrollV;
    }

    public set scrollV(value: number)
    {
        this._scrollV = value;
    }

    public get scrollStepH(): number
    {
        return this._scrollStepH;
    }

    public set scrollStepH(value: number)
    {
        this._scrollStepH = value;
    }

    public get scrollStepV(): number
    {
        return this._scrollStepV;
    }

    public set scrollStepV(value: number)
    {
        this._scrollStepV = value;
    }

    public get maxScrollH(): number
    {
        return 0;
    }

    public get maxScrollV(): number
    {
        return 0;
    }

    public get visibleRegion(): { x: number; y: number; width: number; height: number }
    {
        return { x: 0, y: 0, width: this._width, height: this._height };
    }

    public get scrollableRegion(): { x: number; y: number; width: number; height: number }
    {
        return { x: 0, y: 0, width: this._width, height: this._height };
    }

    // ── IInteractiveWindow ──────────────────────────────────────────

    public get toolTipCaption(): string
    {
        return this._toolTipCaption;
    }

    public set toolTipCaption(value: string)
    {
        this._toolTipCaption = value ?? '';
    }

    public get toolTipDelay(): number
    {
        return this._toolTipDelay;
    }

    public set toolTipDelay(value: number)
    {
        this._toolTipDelay = value;
    }

    public get toolTipIsDynamic(): boolean
    {
        return this._toolTipIsDynamic;
    }

    public set toolTipIsDynamic(value: boolean)
    {
        this._toolTipIsDynamic = value;
    }

    public showToolTip(_toolTip: unknown): void
    {
        // Override in subclass
    }

    public hideToolTip(): void
    {
        // Override in subclass
    }

    public setMouseCursorForState(_state: number, _cursor: number): number
    {
        return 0;
    }

    public getMouseCursorByState(_state: number): number
    {
        return 0;
    }
}
