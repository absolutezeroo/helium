import type {IMessageDataWrapper} from '@core/communication';

/**
 * Room event data (promoted room events)
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1680
 */
export class RoomEventData {
    private _adId: number = 0;
    private _ownerAvatarId: number = 0;
    private _ownerAvatarName: string = '';
    private _flatId: number = 0;
    private _eventType: number = 0;
    private _eventName: string = '';
    private _eventDescription: string = '';
    private _creationTime: string = '';
    private _expirationDate: Date;
    private _categoryId: number = 0;
    private _disposed: boolean = false;

    constructor(wrapper: IMessageDataWrapper) {
        this._adId = wrapper.readInt();
        this._ownerAvatarId = wrapper.readInt();
        this._ownerAvatarName = wrapper.readString();
        this._flatId = wrapper.readInt();
        this._eventType = wrapper.readInt();
        this._eventName = wrapper.readString();
        this._eventDescription = wrapper.readString();

        const minutesSinceCreation = wrapper.readInt();
        const minutesUntilExpiration = wrapper.readInt();

        const now = new Date();
        const creationMs = now.getTime() - minutesSinceCreation * 60 * 1000;
        const creationDate = new Date(creationMs);
        this._creationTime =
            creationDate.getDate() +
            '-' +
            creationDate.getMonth() +
            '-' +
            creationDate.getFullYear() +
            ' ' +
            creationDate.getHours() +
            ':' +
            creationDate.getMinutes();

        const expirationMs = now.getTime() + minutesUntilExpiration * 60 * 1000;
        this._expirationDate = new Date(expirationMs);

        this._categoryId = wrapper.readInt();
    }

    get adId(): number {
        return this._adId;
    }

    get ownerAvatarId(): number {
        return this._ownerAvatarId;
    }

    get ownerAvatarName(): string {
        return this._ownerAvatarName;
    }

    get flatId(): number {
        return this._flatId;
    }

    get eventType(): number {
        return this._eventType;
    }

    get eventName(): string {
        return this._eventName;
    }

    get eventDescription(): string {
        return this._eventDescription;
    }

    get creationTime(): string {
        return this._creationTime;
    }

    get expirationDate(): Date {
        return this._expirationDate;
    }

    get categoryId(): number {
        return this._categoryId;
    }

    get disposed(): boolean {
        return this._disposed;
    }

    dispose(): void {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
    }
}
