import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {NavigatorData} from './domain';

// Message events
import {
    CanCreateRoomEventMessageEvent,
    CanCreateRoomMessageEvent,
    CategoriesWithVisitorCountMessageEvent,
    CompetitionRoomsDataMessageEvent,
    ConvertedRoomIdMessageEvent,
    DoorbellMessageEvent,
    FavouriteChangedMessageEvent,
    FavouritesMessageEvent,
    FlatAccessDeniedMessageEvent,
    FlatCreatedMessageEvent,
    GetGuestRoomResultMessageEvent,
    GuestRoomSearchResultMessageEvent,
    NavigatorSettingsMessageEvent,
    OfficialRoomsMessageEvent,
    PopularRoomTagsResultMessageEvent,
    RoomEventCancelMessageEvent,
    RoomEventMessageEvent,
    RoomInfoUpdatedMessageEvent,
    RoomRatingMessageEvent,
    UserEventCatsMessageEvent,
    UserFlatCatsMessageEvent,
} from '../communication/messages/incoming/navigator';

// Parsers
import {
    CanCreateRoomEventMessageParser,
    CanCreateRoomMessageParser,
    CategoriesWithVisitorCountMessageParser,
    CompetitionRoomsDataMessageParser,
    ConvertedRoomIdMessageParser,
    DoorbellMessageParser,
    FavouriteChangedMessageParser,
    FavouritesMessageParser,
    FlatAccessDeniedMessageParser,
    FlatCreatedMessageParser,
    GetGuestRoomResultMessageParser,
    GuestRoomSearchResultMessageParser,
    NavigatorSettingsMessageParser,
    OfficialRoomsMessageParser,
    PopularRoomTagsResultMessageParser,
    RoomEventMessageParser,
    RoomInfoUpdatedMessageParser,
    RoomRatingMessageParser,
    UserEventCatsMessageParser,
    UserFlatCatsMessageParser,
} from '../communication/messages/parser/navigator';

import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('Navigator');

/**
 * Handles incoming navigator messages
 *
 */
export class IncomingMessages {
    private _communication: IHabboCommunicationManager;
    private _data: NavigatorData;
    private _messageEvents: IMessageEvent[] = [];

    constructor(communication: IHabboCommunicationManager, data: NavigatorData) {
        this._communication = communication;
        this._data = data;

        this.registerEvents();
    }

    dispose(): void {
        for (const event of this._messageEvents) {
            this._communication.removeMessageEvent(event);
        }

        this._messageEvents = [];
    }

    private registerEvents(): void {
        // Settings & Favourites
        this.addMessageEvent(new NavigatorSettingsMessageEvent(this.onNavigatorSettings.bind(this)));
        this.addMessageEvent(new FavouritesMessageEvent(this.onFavourites.bind(this)));
        this.addMessageEvent(new FavouriteChangedMessageEvent(this.onFavouriteChanged.bind(this)));

        // Room info
        this.addMessageEvent(new GetGuestRoomResultMessageEvent(this.onGetGuestRoomResult.bind(this)));
        this.addMessageEvent(new RoomInfoUpdatedMessageEvent(this.onRoomInfoUpdated.bind(this)));
        this.addMessageEvent(new RoomRatingMessageEvent(this.onRoomRating.bind(this)));

        // Search results
        this.addMessageEvent(new GuestRoomSearchResultMessageEvent(this.onGuestRoomSearchResult.bind(this)));
        this.addMessageEvent(new PopularRoomTagsResultMessageEvent(this.onPopularRoomTagsResult.bind(this)));
        this.addMessageEvent(new OfficialRoomsMessageEvent(this.onOfficialRooms.bind(this)));
        this.addMessageEvent(new CategoriesWithVisitorCountMessageEvent(this.onCategoriesWithVisitorCount.bind(this)));

        // Categories
        this.addMessageEvent(new UserFlatCatsMessageEvent(this.onUserFlatCats.bind(this)));
        this.addMessageEvent(new UserEventCatsMessageEvent(this.onUserEventCats.bind(this)));

        // Room creation
        this.addMessageEvent(new CanCreateRoomMessageEvent(this.onCanCreateRoom.bind(this)));
        this.addMessageEvent(new CanCreateRoomEventMessageEvent(this.onCanCreateRoomEvent.bind(this)));
        this.addMessageEvent(new FlatCreatedMessageEvent(this.onFlatCreated.bind(this)));

        // Room events
        this.addMessageEvent(new RoomEventMessageEvent(this.onRoomEvent.bind(this)));
        this.addMessageEvent(new RoomEventCancelMessageEvent(this.onRoomEventCancel.bind(this)));

        // Access
        this.addMessageEvent(new DoorbellMessageEvent(this.onDoorbell.bind(this)));
        this.addMessageEvent(new FlatAccessDeniedMessageEvent(this.onFlatAccessDenied.bind(this)));

        // Misc
        this.addMessageEvent(new ConvertedRoomIdMessageEvent(this.onConvertedRoomId.bind(this)));
        this.addMessageEvent(new CompetitionRoomsDataMessageEvent(this.onCompetitionRoomsData.bind(this)));
    }

    private addMessageEvent(event: IMessageEvent): void {
        this._communication.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    // ========== Message Handlers ==========

    private onNavigatorSettings(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as NavigatorSettingsMessageParser;

        if (!parser) return;

        this._data.homeRoomId = parser.homeRoomId;
        this._data.settingsReceived = true;

        log.debug(`Navigator settings received: homeRoomId=${parser.homeRoomId}`);
    }

    private onFavourites(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as FavouritesMessageParser;

        if (!parser) return;

        this._data.onFavourites(parser.limit, parser.favouriteRoomIds);

        log.debug(`Favourites received: ${parser.favouriteRoomIds.length} rooms`);
    }

    private onFavouriteChanged(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as FavouriteChangedMessageParser;

        if (!parser) return;

        this._data.favouriteChanged(parser.flatId, parser.added);

        log.debug(`Favourite changed: roomId=${parser.flatId}, added=${parser.added}`);
    }

    private onGetGuestRoomResult(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as GetGuestRoomResultMessageParser;

        if (!parser) return;

        if (!parser.data) return;

        this._data.enteredGuestRoom = parser.data;
        this._data.currentRoomIsStaffPick = parser.staffPick;

        log.debug(`Guest room result: ${parser.data.roomName} (${parser.data.flatId})`);
    }

    private onRoomInfoUpdated(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as RoomInfoUpdatedMessageParser;

        if (!parser) return;

        log.debug(`Room info updated: ${parser.flatId}`);
        // Trigger refresh of room info
    }

    private onRoomRating(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as RoomRatingMessageParser;

        if (!parser) return;

        this._data.currentRoomRating = parser.rating;
        this._data.canRate = parser.canRate;

        log.debug(`Room rating: ${parser.rating}, canRate=${parser.canRate}`);
    }

    private onGuestRoomSearchResult(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as GuestRoomSearchResultMessageParser;

        if (!parser) return;

        if (!parser.data) return;

        this._data.guestRoomSearchResults = parser.data;

        log.debug(`Guest room search results: ${parser.data.rooms.length} rooms`);
    }

    private onPopularRoomTagsResult(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as PopularRoomTagsResultMessageParser;

        if (!parser) return;

        if (!parser.data) return;

        this._data.popularTags = parser.data;

        log.debug(`Popular tags received: ${parser.data.tags.length} tags`);
    }

    private onOfficialRooms(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as OfficialRoomsMessageParser;

        if (parser.data) {
            this._data.officialRooms = parser.data;
            this._data.adRoom = parser.adRoom;
            this._data.promotedRooms = parser.promotedRooms;

            log.debug(`Official rooms received: ${parser.data.entries.length} entries`);
        }
    }

    private onCategoriesWithVisitorCount(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as CategoriesWithVisitorCountMessageParser;

        if (!parser) return;

        if (!parser.data) return;

        this._data.categoriesWithVisitorData = parser.data;

        log.debug('Categories with visitor count received');
    }

    private onUserFlatCats(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as UserFlatCatsMessageParser;

        if (!parser) return;

        this._data.categories = parser.nodes;

        log.debug(`User flat categories received: ${parser.nodes.length} categories`);
    }

    private onUserEventCats(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as UserEventCatsMessageParser;

        if (!parser) return;

        this._data.eventCategories = parser.eventCategories;

        log.debug(`User event categories received: ${parser.eventCategories.length} categories`);
    }

    private onCanCreateRoom(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as CanCreateRoomMessageParser;

        if (!parser) return;

        log.debug(`Can create room: code=${parser.resultCode}, limit=${parser.roomLimit}`);
        // Handle room creation permission check result
    }

    private onCanCreateRoomEvent(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as CanCreateRoomEventMessageParser;

        if (!parser) return;

        log.debug(`Can create room event: ${parser.canCreateEvent}, error=${parser.errorCode}`);
        // Handle room event creation permission check result
    }

    private onFlatCreated(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as FlatCreatedMessageParser;

        if (!parser) return;

        this._data.createdFlatId = parser.flatId;

        log.info(`Flat created: ${parser.flatName} (${parser.flatId})`);
    }

    private onRoomEvent(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as RoomEventMessageParser;

        if (!parser) return;

        if (!parser.data) return;

        this._data.roomEventData = parser.data;

        log.debug(`Room event: ${parser.data.eventName}`);
    }

    private onRoomEventCancel(_event: IMessageEvent): void {
        this._data.roomEventData = null;

        log.debug('Room event cancelled');
    }

    private onDoorbell(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as DoorbellMessageParser;

        if (!parser) return;

        log.debug(`Doorbell: ${parser.userName}`);
        // Handle doorbell notification
    }

    private onFlatAccessDenied(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as FlatAccessDeniedMessageParser;

        if (!parser) return;

        log.debug(`Flat access denied: roomId=${parser.flatId}, user=${parser.userName}`);
        // Handle access denied
    }

    private onConvertedRoomId(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as ConvertedRoomIdMessageParser;

        if (!parser) return;

        log.debug(`Converted room ID: ${parser.globalId} -> ${parser.convertedId}`);
        // Handle room ID conversion result
    }

    private onCompetitionRoomsData(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as CompetitionRoomsDataMessageParser;

        if (!parser) return;

        if (!parser.data) return;

        this._data.competitionRoomsData = parser.data;

        log.debug(`Competition rooms data: goal=${parser.data.goalId}, page=${parser.data.pageIndex}`);
    }
}
