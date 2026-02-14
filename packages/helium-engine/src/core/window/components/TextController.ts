import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import { WindowController } from '../WindowController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Base controller for text-displaying windows.
 *
 * Stores text content and color. Serves as the base class for
 * TextLabelController, TextFieldController, and TextLinkController.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/TextController.as
 */
export class TextController extends WindowController
{
    protected _text: string = '';
    protected _textColor: number = 0x000000;

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
}
