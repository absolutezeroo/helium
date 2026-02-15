import type {IIlluminaInputWidget} from './IIlluminaInputWidget';
import type {IIlluminaInputHandler} from './IIlluminaInputHandler';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

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

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _message: string = '';

	public get message(): string
	{
		return this._message;
	}

	public set message(value: string)
	{
		this._message = value;
	}

	private _submitHandler: IIlluminaInputHandler | null = null;

	public get submitHandler(): IIlluminaInputHandler | null
	{
		return this._submitHandler;
	}

	public set submitHandler(value: IIlluminaInputHandler | null)
	{
		this._submitHandler = value;
	}

	private _buttonCaption: string = '${widgets.chatinput.say}';

	public get buttonCaption(): string
	{
		return this._buttonCaption;
	}

	public set buttonCaption(value: string)
	{
		this._buttonCaption = value;
	}

	private _emptyMessage: string = '';

	public get emptyMessage(): string
	{
		return this._emptyMessage;
	}

	public set emptyMessage(value: string)
	{
		this._emptyMessage = value;
	}

	private _multiline: boolean = false;

	public get multiline(): boolean
	{
		return this._multiline;
	}

	public set multiline(value: boolean)
	{
		this._multiline = value;
	}

	private _maxChars: number = 0;

	public get maxChars(): number
	{
		return this._maxChars;
	}

	public set maxChars(value: number)
	{
		this._maxChars = value;
	}

	public get properties(): PropertyStruct[]
	{
		if(this._disposed) return [];

		return [
			new PropertyStruct(IlluminaInputWidget.BUTTON_CAPTION_KEY, this._buttonCaption),
			new PropertyStruct(IlluminaInputWidget.EMPTY_MESSAGE_KEY, this._emptyMessage),
			new PropertyStruct(IlluminaInputWidget.MULTILINE_KEY, this._multiline),
			new PropertyStruct(IlluminaInputWidget.MAX_CHARS_KEY, this._maxChars),
		];
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

	public set properties(values: PropertyStruct[])
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

	public dispose(): void
	{
		if(this._disposed) return;

		this._widgetWindow = null;
		this._windowManager = null;
		this._submitHandler = null;
		this._disposed = true;
	}
}
