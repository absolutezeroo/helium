import type { IIlluminaChatBubbleWidget } from './IIlluminaChatBubbleWidget';
import type { IWidgetProperty } from './IWidget';

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

    private _disposed: boolean = false;
    private _flipped: boolean = false;
    private _userName: string = '';
    private _userId: number = 0;
    private _figure: string = '';
    private _timeStamp: number = 0;
    private _friendOnline: boolean = true;
    private _messages: string[] = [];
    private _confirmationIds: number[] = [];

    constructor()
    {
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

    public get flipped(): boolean
    {
        return this._flipped;
    }

    public set flipped(value: boolean)
    {
        this._flipped = value;
    }

    public get userName(): string
    {
        return this._userName;
    }

    public set userName(value: string)
    {
        this._userName = value;
    }

    public get userId(): number
    {
        return this._userId;
    }

    public set userId(value: number)
    {
        this._userId = value;
    }

    public get figure(): string
    {
        return this._figure;
    }

    public set figure(value: string)
    {
        this._figure = value;
    }

    public get timeStamp(): number
    {
        return this._timeStamp;
    }

    public set timeStamp(value: number)
    {
        this._timeStamp = value;
    }

    public set friendOnlineStatus(value: boolean)
    {
        this._friendOnline = value;
    }

    public get friendOnline(): boolean
    {
        return this._friendOnline;
    }

    public get numMessages(): number
    {
        return this._messages.length;
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

    public get properties(): IWidgetProperty[]
    {
        if(this._disposed) return [];

        return [
            { key: IlluminaChatBubbleWidget.FLIPPED_KEY, value: this._flipped, type: 'Boolean' },
            { key: IlluminaChatBubbleWidget.USER_NAME_KEY, value: this._userName, type: 'String' },
            { key: IlluminaChatBubbleWidget.FIGURE_KEY, value: this._figure, type: 'String' },
            { key: IlluminaChatBubbleWidget.MESSAGE_KEY, value: this._messages.join('\t'), type: 'String' },
        ];
    }

    public setProperties(values: IWidgetProperty[]): void
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

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._messages = [];
        this._confirmationIds = [];
        this._disposed = true;
    }
}

