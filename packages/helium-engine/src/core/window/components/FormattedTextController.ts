import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import { WindowController } from '../WindowController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Controller for formatted (HTML) text windows.
 *
 * Extends WindowController with visual content rendering for
 * formatted/rich text. In AS3, this extended TextController and
 * set htmlText on the underlying TextField.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/FormattedTextController.as
 */
export class FormattedTextController extends WindowController
{
    private _text: string = '';

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

        this._hasVisualContent = true;
    }

    /**
     * The formatted text content.
     */
    public get text(): string
    {
        return this._text;
    }

    public set text(value: string)
    {
        if(value === null)
        {
            return;
        }

        this._text = value;
    }
}
