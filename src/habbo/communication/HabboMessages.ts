import type {
    ComposerClass,
    EventClass,
    IMessageConfiguration
} from '@core/communication/messages/IMessageConfiguration';

// Incoming Events - Handshake
import {
    AuthenticationOKMessageEvent,
    CompleteDiffieHandshakeMessageEvent,
    DisconnectReasonMessageEvent,
    GenericErrorMessageEvent,
    InitDiffieHandshakeMessageEvent,
    IsFirstLoginOfDayMessageEvent,
    NoobnessLevelMessageEvent,
    PingMessageEvent,
    UniqueMachineIdMessageEvent,
    UserObjectMessageEvent,
    UserRightsMessageEvent,
} from './messages/incoming/handshake';

// Incoming Events - Availability
import {AvailabilityStatusMessageEvent,} from './messages/incoming/availability';

// Incoming Events - Avatar
import {FigureUpdateMessageEvent,} from './messages/incoming/avatar';

// Incoming Events - Navigator
import {FavouritesMessageEvent, NavigatorSettingsMessageEvent,} from './messages/incoming/navigator';

// Incoming Events - Notifications
import {ActivityPointsMessageEvent, InfoFeedEnableMessageEvent,} from './messages/incoming/notifications';

// Incoming Events - Inventory
import {
    AchievementsScoreMessageEvent,
    AvatarEffectsMessageEvent,
    FigureSetIdsMessageEvent,
} from './messages/incoming/inventory';

// Incoming Events - Mystery Box
import {MysteryBoxKeysMessageEvent,} from './messages/incoming/mysterybox';

// Incoming Events - Catalog
import {BuildersClubSubscriptionStatusMessageEvent,} from './messages/incoming/catalog';

// Outgoing Composers
import {
    ClientHelloMessageComposer,
    CompleteDiffieHandshakeMessageComposer,
    DisconnectMessageComposer,
    EventLogMessageComposer,
    InfoRetrieveMessageComposer,
    InitDiffieHandshakeMessageComposer,
    PongMessageComposer,
    SSOTicketMessageComposer,
    UniqueIDMessageComposer,
    VersionCheckMessageComposer,
} from './messages/outgoing';

/**
 * Habbo message configuration
 * Maps message IDs to their composer and event classes
 */
export class HabboMessages implements IMessageConfiguration {
    constructor() {
        this.registerEvents();
        this.registerComposers();
    }

    private _events: Map<number, EventClass> = new Map();

    get events(): Map<number, EventClass> {
        return this._events;
    }

    private _composers: Map<number, ComposerClass> = new Map();

    get composers(): Map<number, ComposerClass> {
        return this._composers;
    }

    /**
     * Register incoming message events (Server -> Client)
     */
    private registerEvents(): void {
        // === HANDSHAKE ===
        this._events.set(771, InitDiffieHandshakeMessageEvent);
        this._events.set(3777, CompleteDiffieHandshakeMessageEvent);
        this._events.set(2323, AuthenticationOKMessageEvent);
        this._events.set(3974, UniqueMachineIdMessageEvent);
        this._events.set(4000, DisconnectReasonMessageEvent);

        // === SESSION ===
        this._events.set(658, PingMessageEvent);
        this._events.set(598, GenericErrorMessageEvent);
        this._events.set(1416, UserRightsMessageEvent);
        this._events.set(3048, UserObjectMessageEvent);
        this._events.set(1916, NoobnessLevelMessageEvent);

        // === AVAILABILITY ===
        this._events.set(3449, AvailabilityStatusMessageEvent);

        // === AVATAR ===
        this._events.set(836, FigureUpdateMessageEvent);

        // === NAVIGATOR ===
        this._events.set(895, NavigatorSettingsMessageEvent);
        this._events.set(2676, FavouritesMessageEvent);

        // === NOTIFICATIONS ===
        this._events.set(2875, ActivityPointsMessageEvent);
        this._events.set(114, InfoFeedEnableMessageEvent);

        // === INVENTORY ===
        this._events.set(464, FigureSetIdsMessageEvent);
        this._events.set(1196, AchievementsScoreMessageEvent);
        this._events.set(1119, AvatarEffectsMessageEvent);

        // === MYSTERY BOX ===
        this._events.set(351, MysteryBoxKeysMessageEvent);

        // === CATALOG ===
        this._events.set(3907, BuildersClubSubscriptionStatusMessageEvent);

        // === HANDSHAKE (continued) ===
        this._events.set(3129, IsFirstLoginOfDayMessageEvent);
    }

    /**
     * Register outgoing message composers (Client -> Server)
     */
    private registerComposers(): void {
        // === HANDSHAKE ===
        this._composers.set(4000, ClientHelloMessageComposer);
        this._composers.set(586, InitDiffieHandshakeMessageComposer);
        this._composers.set(2616, CompleteDiffieHandshakeMessageComposer);
        this._composers.set(2602, VersionCheckMessageComposer);
        this._composers.set(53, SSOTicketMessageComposer);
        this._composers.set(1390, UniqueIDMessageComposer);

        // === SESSION ===
        this._composers.set(2596, PongMessageComposer);
        this._composers.set(1113, DisconnectMessageComposer);
        this._composers.set(245, InfoRetrieveMessageComposer);

        // === TRACKING ===
        this._composers.set(2297, EventLogMessageComposer);

        // TODO: Add more message composers as needed...
    }
}
