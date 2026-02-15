import type {IIlluminaChatBubbleWidget} from './IIlluminaChatBubbleWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Illumina chat bubble widget.
 *
 * Renders a chat bubble with avatar, username, message list, timestamp,
 * and online status indicator. Supports flipped layout and message
 * confirmation tracking.
 *
 * In the AS3 version, uses complex IWindowContainer hierarchy with
 * IItemListWindow for messages. In the TypeScript port, chat bubble
 * data is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/IlluminaChatBubbleWidget.as
 */
export class IlluminaChatBubbleWidget implements IIlluminaChatBubbleWidget
{
	public static readonly TYPE: string = 'illumina_chat_bubble';

	private static readonly FLIPPED_KEY: string = 'illumina_chat_bubble:flipped';
	private static readonly USER_NAME_KEY: string = 'illumina_chat_bubble:user_name';
	private static readonly FIGURE_KEY: string = 'illumina_chat_bubble:figure';
	private static readonly MESSAGE_KEY: string = 'illumina_chat_bubble:message';
	private _messages: string[] = [];
	private _confirmationIds: number[] = [];
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

	private _flipped: boolean = false;

	public get flipped(): boolean
	{
		return this._flipped;
	}

	public set flipped(value: boolean)
	{
		this._flipped = value;
	}

	private _userName: string = '';

	public get userName(): string
	{
		return this._userName;
	}

	public set userName(value: string)
	{
		this._userName = value;
	}

	private _userId: number = 0;

	public get userId(): number
	{
		return this._userId;
	}

	public set userId(value: number)
	{
		this._userId = value;
	}

	private _figure: string = '';

	public get figure(): string
	{
		return this._figure;
	}

	public set figure(value: string)
	{
		this._figure = value;
	}

	private _timeStamp: number = 0;

	public get timeStamp(): number
	{
		return this._timeStamp;
	}

	public set timeStamp(value: number)
	{
		this._timeStamp = value;
	}

	private _friendOnline: boolean = true;

	public get friendOnline(): boolean
	{
		return this._friendOnline;
	}

	public set friendOnlineStatus(value: boolean)
	{
		this._friendOnline = value;
	}

	public get numMessages(): number
	{
		return this._messages.length;
	}

	public get properties(): PropertyStruct[]
	{
		if(this._disposed) return [];

		return [
			new PropertyStruct(IlluminaChatBubbleWidget.FLIPPED_KEY, this._flipped),
			new PropertyStruct(IlluminaChatBubbleWidget.USER_NAME_KEY, this._userName),
			new PropertyStruct(IlluminaChatBubbleWidget.FIGURE_KEY, this._figure),
			new PropertyStruct(IlluminaChatBubbleWidget.MESSAGE_KEY, this._messages.join('\t')),
		];
	}

	/**
	 * Parse messages from a tab-separated property string.
	 */
	public static getMessagesFromProperty(value: string): string[]
	{
		const parts = value.split('\t');

		if(parts.length === 1 && parts[0] === '')
		{
			return [];
		}

		return parts;
	}

	public getMessage(index: number): string
	{
		return this._messages[index] ?? '';
	}

	public setMessage(index: number, text: string): void
	{
		while(index >= this._messages.length)
		{
			this._messages.push('');
			this._confirmationIds.push(0);
		}

		this._messages[index] = text;
	}

	public appendMessage(text: string, prepend: boolean = false, confirmationId: number = 0): void
	{
		let index: number;

		if(prepend)
		{
			index = 0;
			this._messages.splice(0, 0, '');
			this._confirmationIds.splice(0, 0, 0);
		}
		else
		{
			index = this._messages.length;
		}

		this.setMessage(index, text);
		this.setAwaitingConfirmationId(index, confirmationId);
	}

	public setAwaitingConfirmationId(messageIndex: number, confirmationId: number): void
	{
		if(messageIndex < this._confirmationIds.length)
		{
			this._confirmationIds[messageIndex] = confirmationId;
		}
	}

	public clearAwaitingConfirmationId(messageIndex: number): void
	{
		if(messageIndex < this._confirmationIds.length)
		{
			this._confirmationIds[messageIndex] = 0;
		}
	}

	public getAwaitingConfirmationId(messageIndex: number): number
	{
		return this._confirmationIds[messageIndex] ?? 0;
	}

	public set properties(values: PropertyStruct[])
	{
		for(const prop of values)
		{
			switch(prop.key)
			{
				case IlluminaChatBubbleWidget.FLIPPED_KEY:
					this.flipped = Boolean(prop.value);
					break;
				case IlluminaChatBubbleWidget.USER_NAME_KEY:
					this.userName = String(prop.value);
					break;
				case IlluminaChatBubbleWidget.FIGURE_KEY:
					this.figure = String(prop.value);
					break;
				case IlluminaChatBubbleWidget.MESSAGE_KEY:
				{
					const msgs = IlluminaChatBubbleWidget.getMessagesFromProperty(String(prop.value));
					this._messages = [];
					this._confirmationIds = [];

					for(const msg of msgs)
					{
						this.appendMessage(msg);
					}
					break;
				}
			}
		}
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._widgetWindow = null;
		this._windowManager = null;
		this._messages = [];
		this._confirmationIds = [];
		this._disposed = true;
	}
}
