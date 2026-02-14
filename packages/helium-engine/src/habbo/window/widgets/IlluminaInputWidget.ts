import type { IIlluminaInputWidget } from './IIlluminaInputWidget';
import type { IIlluminaInputHandler } from './IIlluminaInputHandler';
import type { IWidgetProperty } from './IWidget';

/**
 * Illumina input field widget.
 *
 * Provides a text input field with optional submit button, empty message
 * placeholder, and multiline support. Submit handler is called when
 * the user presses Enter or clicks the submit button.
 *
 * In the AS3 version, uses ITextFieldWindow, ILabelWindow, and handles
 * WindowKeyboardEvent for Enter key detection. In the TypeScript port,
 * input state is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/IlluminaInputWidget.as
 */
export class IlluminaInputWidget implements IIlluminaInputWidget
{
    public static readonly TYPE: string = 'illumina_input';

    private static readonly BUTTON_CAPTION_KEY: string = 'illumina_input:button_caption';
    private static readonly EMPTY_MESSAGE_KEY: string = 'illumina_input:empty_message';
    private static readonly MULTILINE_KEY: string = 'illumina_input:multiline';
    private static readonly MAX_CHARS_KEY: string = 'illumina_input:max_chars';

    private static readonly SINGLE_LINE_HEIGHT: number = 28;

    private _disposed: boolean = false;
    private _message: string = '';
    private _submitHandler: IIlluminaInputHandler | null = null;
    private _buttonCaption: string = '${widgets.chatinput.say}';
    private _emptyMessage: string = '';
    private _multiline: boolean = false;
    private _maxChars: number = 0;

    constructor()
    {
    }

    public get message(): string
    {
        return this._message;
    }

    public set message(value: string)
    {
        this._message = value;
    }

    public get submitHandler(): IIlluminaInputHandler | null
    {
        return this._submitHandler;
    }

    public set submitHandler(value: IIlluminaInputHandler | null)
    {
        this._submitHandler = value;
    }

    public get buttonCaption(): string
    {
        return this._buttonCaption;
    }

    public set buttonCaption(value: string)
    {
        this._buttonCaption = value;
    }

    public get emptyMessage(): string
    {
        return this._emptyMessage;
    }

    public set emptyMessage(value: string)
    {
        this._emptyMessage = value;
    }

    public get multiline(): boolean
    {
        return this._multiline;
    }

    public set multiline(value: boolean)
    {
        this._multiline = value;
    }

    public get maxChars(): number
    {
        return this._maxChars;
    }

    public set maxChars(value: number)
    {
        this._maxChars = value;
    }

    /**
     * Submit the current message via the handler.
     *
     * @param widgetId - The widget identifier
     */
    public submitMessage(widgetId: string): void
    {
        if(this._submitHandler)
        {
            this._submitHandler.onInput(widgetId, this._message);
        }
    }

    public get properties(): IWidgetProperty[]
    {
        if(this._disposed) return [];

        return [
            { key: IlluminaInputWidget.BUTTON_CAPTION_KEY, value: this._buttonCaption, type: 'String' },
            { key: IlluminaInputWidget.EMPTY_MESSAGE_KEY, value: this._emptyMessage, type: 'String' },
            { key: IlluminaInputWidget.MULTILINE_KEY, value: this._multiline, type: 'Boolean' },
            { key: IlluminaInputWidget.MAX_CHARS_KEY, value: this._maxChars, type: 'int' },
        ];
    }

    public setProperties(values: IWidgetProperty[]): void
    {
        for(const prop of values)
        {
            switch(prop.key)
            {
                case IlluminaInputWidget.BUTTON_CAPTION_KEY:
                    this.buttonCaption = String(prop.value);
                    break;
                case IlluminaInputWidget.EMPTY_MESSAGE_KEY:
                    this.emptyMessage = String(prop.value);
                    break;
                case IlluminaInputWidget.MULTILINE_KEY:
                    this.multiline = Boolean(prop.value);
                    break;
                case IlluminaInputWidget.MAX_CHARS_KEY:
                    this.maxChars = Number(prop.value);
                    break;
            }
        }
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._submitHandler = null;
        this._disposed = true;
    }
}

