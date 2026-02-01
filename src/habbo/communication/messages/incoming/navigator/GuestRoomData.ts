import type {IMessageDataWrapper} from '@core/communication';
import {RoomThumbnailData} from './RoomThumbnailData';

/**
 * Door mode constants
 */
export const RoomDoorMode = {
    OPEN: 0,
    DOORBELL: 1,
    PASSWORD: 2,
    INVISIBLE: 3,
    NOOBS_ONLY: 4,
} as const;

/**
 * Trade mode constants
 */
export const RoomTradeMode = {
    NOT_ALLOWED: 0,
    RIGHTS_OWNERS: 1,
    ALLOWED: 2,
} as const;

/**
 * Bitflags for room data
 */
const ROOM_FLAG_THUMBNAIL = 1;
const ROOM_FLAG_GROUP = 2;
const ROOM_FLAG_PROMOTION = 4;
const ROOM_FLAG_SHOW_OWNER = 8;
const ROOM_FLAG_ALLOW_PETS = 16;
const ROOM_FLAG_DISPLAY_AD = 32;

/**
 * Guest room data containing all room information
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1675
 */
export class GuestRoomData {
    private _flatId: number = 0;
    private _roomName: string = '';
    private _ownerId: number = 0;
    private _ownerName: string = '';
    private _doorMode: number = 0;
    private _userCount: number = 0;
    private _maxUserCount: number = 0;
    private _description: string = '';
    private _tradeMode: number = 0;
    private _score: number = 0;
    private _ranking: number = 0;
    private _categoryId: number = 0;
    private _tags: string[] = [];
    private _officialRoomPicRef: string | null = null;
    private _habboGroupId: number = 0;
    private _groupName: string = '';
    private _groupBadgeCode: string = '';
    private _roomAdName: string = '';
    private _roomAdDescription: string = '';
    private _roomAdExpiresInMin: number = 0;
    private _showOwner: boolean = false;
    private _allowPets: boolean = false;
    private _displayRoomEntryAd: boolean = false;
    private _thumbnail: RoomThumbnailData;
    private _allInRoomMuted: boolean = false;
    private _canMute: boolean = false;
    private _disposed: boolean = false;

    constructor(wrapper: IMessageDataWrapper) {
        this._flatId = wrapper.readInt();
        this._roomName = wrapper.readString();
        this._ownerId = wrapper.readInt();
        this._ownerName = wrapper.readString();
        this._doorMode = wrapper.readInt();
        this._userCount = wrapper.readInt();
        this._maxUserCount = wrapper.readInt();
        this._description = wrapper.readString();
        this._tradeMode = wrapper.readInt();
        this._score = wrapper.readInt();
        this._ranking = wrapper.readInt();
        this._categoryId = wrapper.readInt();

        const tagCount = wrapper.readInt();
        for (let i = 0; i < tagCount; i++) {
            this._tags.push(wrapper.readString());
        }

        const flags = wrapper.readInt();

        if ((flags & ROOM_FLAG_THUMBNAIL) > 0) {
            this._officialRoomPicRef = wrapper.readString();
        }

        if ((flags & ROOM_FLAG_GROUP) > 0) {
            this._habboGroupId = wrapper.readInt();
            this._groupName = wrapper.readString();
            this._groupBadgeCode = wrapper.readString();
        }

        if ((flags & ROOM_FLAG_PROMOTION) > 0) {
            this._roomAdName = wrapper.readString();
            this._roomAdDescription = wrapper.readString();
            this._roomAdExpiresInMin = wrapper.readInt();
        }

        this._showOwner = (flags & ROOM_FLAG_SHOW_OWNER) > 0;
        this._allowPets = (flags & ROOM_FLAG_ALLOW_PETS) > 0;
        this._displayRoomEntryAd = (flags & ROOM_FLAG_DISPLAY_AD) > 0;

        this._thumbnail = new RoomThumbnailData(null);
        this._thumbnail.setDefaults();
    }

    get flatId(): number {
        return this._flatId;
    }

    get roomName(): string {
        return this._roomName;
    }

    set roomName(value: string) {
        this._roomName = value;
    }

    get ownerId(): number {
        return this._ownerId;
    }

    get ownerName(): string {
        return this._ownerName;
    }

    get doorMode(): number {
        return this._doorMode;
    }

    get userCount(): number {
        return this._userCount;
    }

    get maxUserCount(): number {
        return this._maxUserCount;
    }

    get description(): string {
        return this._description;
    }

    get tradeMode(): number {
        return this._tradeMode;
    }

    get score(): number {
        return this._score;
    }

    get ranking(): number {
        return this._ranking;
    }

    get categoryId(): number {
        return this._categoryId;
    }

    get tags(): string[] {
        return this._tags;
    }

    get officialRoomPicRef(): string | null {
        return this._officialRoomPicRef;
    }

    get habboGroupId(): number {
        return this._habboGroupId;
    }

    get groupName(): string {
        return this._groupName;
    }

    get groupBadgeCode(): string {
        return this._groupBadgeCode;
    }

    get roomAdName(): string {
        return this._roomAdName;
    }

    get roomAdDescription(): string {
        return this._roomAdDescription;
    }

    get roomAdExpiresInMin(): number {
        return this._roomAdExpiresInMin;
    }

    get showOwner(): boolean {
        return this._showOwner;
    }

    get allowPets(): boolean {
        return this._allowPets;
    }

    get displayRoomEntryAd(): boolean {
        return this._displayRoomEntryAd;
    }

    get thumbnail(): RoomThumbnailData {
        return this._thumbnail;
    }

    get allInRoomMuted(): boolean {
        return this._allInRoomMuted;
    }

    set allInRoomMuted(value: boolean) {
        this._allInRoomMuted = value;
    }

    get canMute(): boolean {
        return this._canMute;
    }

    set canMute(value: boolean) {
        this._canMute = value;
    }

    get disposed(): boolean {
        return this._disposed;
    }

    dispose(): void {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        this._tags = [];
    }
}
