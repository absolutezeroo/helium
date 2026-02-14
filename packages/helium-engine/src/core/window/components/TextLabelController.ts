import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { ILabelWindow } from './ILabelWindow';
import { TextController } from './TextController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Controller for label windows.
 *
 * A lightweight text display that renders text content using
 * shared TextFieldCache instances. Implements ILabelWindow.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/TextLabelController.as
 */
export class TextLabelController extends TextController implements ILabelWindow
{
    private _textBackground: boolean = false;
    private _textBackgroundColor: number = 0xFFFFFF;
    private _vertical: boolean = false;

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

    public get vertical(): boolean
    {
        return this._vertical;
    }

    public set vertical(value: boolean)
    {
        this._vertical = value;
    }
}
