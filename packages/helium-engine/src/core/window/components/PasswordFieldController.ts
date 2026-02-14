import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import { WindowController } from '../WindowController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Controller for password field windows.
 *
 * Extends WindowController with masked text input behavior. The stored
 * text is kept as-is but displayed masked.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/PasswordFieldController.as
 */
export class PasswordFieldController extends WindowController
{
    private _text: string = '';
    private _displayAsPassword: boolean = true;

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
     * The actual text value (stored unmasked).
     */
    public get text(): string
    {
        return this._text;
    }

    public set text(value: string)
    {
        this._text = value ?? '';
    }

    /**
     * Whether the text is displayed as a password (masked).
     */
    public get displayAsPassword(): boolean
    {
        return this._displayAsPassword;
    }

    public set displayAsPassword(value: boolean)
    {
        this._displayAsPassword = value;
    }

    /**
     * Returns the masked display text.
     */
    public get maskedText(): string
    {
        if(this._displayAsPassword)
        {
            return '\u2022'.repeat(this._text.length);
        }

        return this._text;
    }
}
