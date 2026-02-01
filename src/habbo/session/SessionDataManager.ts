import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {ISessionDataManager, SessionDataManagerEvents} from './ISessionDataManager';
import {HabboClubLevelEnum} from './enum';

// Events
import {UserObjectMessageEvent} from '../communication/messages/incoming/handshake/UserObjectMessageEvent';
import {UserRightsMessageEvent} from '../communication/messages/incoming/handshake/UserRightsMessageEvent';
import {NoobnessLevelMessageEvent} from '../communication/messages/incoming/handshake/NoobnessLevelMessageEvent';
import {
    IsFirstLoginOfDayMessageEvent
} from '../communication/messages/incoming/handshake/IsFirstLoginOfDayMessageEvent';
import {
    AvailabilityStatusMessageEvent
} from '../communication/messages/incoming/availability/AvailabilityStatusMessageEvent';
import {FigureUpdateMessageEvent} from '../communication/messages/incoming/avatar/FigureUpdateMessageEvent';
import {
    NavigatorSettingsMessageEvent
} from '../communication/messages/incoming/navigator/NavigatorSettingsMessageEvent';
import {FavouritesMessageEvent} from '../communication/messages/incoming/navigator/FavouritesMessageEvent';
import {ActivityPointsMessageEvent} from '../communication/messages/incoming/notifications/ActivityPointsMessageEvent';
import {InfoFeedEnableMessageEvent} from '../communication/messages/incoming/notifications/InfoFeedEnableMessageEvent';
import {
    AchievementsScoreMessageEvent
} from '../communication/messages/incoming/inventory/AchievementsScoreMessageEvent';
import {FigureSetIdsMessageEvent} from '../communication/messages/incoming/inventory/FigureSetIdsMessageEvent';
import {AvatarEffectsMessageEvent} from '../communication/messages/incoming/inventory/AvatarEffectsMessageEvent';
import {MysteryBoxKeysMessageEvent} from '../communication/messages/incoming/mysterybox/MysteryBoxKeysMessageEvent';
import {
    BuildersClubSubscriptionStatusMessageEvent
} from '../communication/messages/incoming/catalog/BuildersClubSubscriptionStatusMessageEvent';

// Parsers
import type {UserObjectMessageParser} from '../communication/messages/parser/handshake/UserObjectMessageParser';
import type {UserRightsMessageParser} from '../communication/messages/parser/handshake/UserRightsMessageParser';
import type {NoobnessLevelMessageParser} from '../communication/messages/parser/handshake/NoobnessLevelMessageParser';
import type {
    IsFirstLoginOfDayMessageParser
} from '../communication/messages/parser/handshake/IsFirstLoginOfDayMessageParser';
import type {
    AvailabilityStatusMessageParser
} from '../communication/messages/parser/availability/AvailabilityStatusMessageParser';
import type {FigureUpdateMessageParser} from '../communication/messages/parser/avatar/FigureUpdateMessageParser';
import type {
    NavigatorSettingsMessageParser
} from '../communication/messages/parser/navigator/NavigatorSettingsMessageParser';
import type {FavouritesMessageParser} from '../communication/messages/parser/navigator/FavouritesMessageParser';
import type {
    ActivityPointsMessageParser
} from '../communication/messages/parser/notifications/ActivityPointsMessageParser';
import type {
    InfoFeedEnableMessageParser
} from '../communication/messages/parser/notifications/InfoFeedEnableMessageParser';
import type {
    AchievementsScoreMessageParser
} from '../communication/messages/parser/inventory/AchievementsScoreMessageParser';
import type {FigureSetIdsMessageParser} from '../communication/messages/parser/inventory/FigureSetIdsMessageParser';
import type {
    AvatarEffect,
    AvatarEffectsMessageParser
} from '../communication/messages/parser/inventory/AvatarEffectsMessageParser';
import type {
    MysteryBoxKeysMessageParser
} from '../communication/messages/parser/mysterybox/MysteryBoxKeysMessageParser';
import type {
    BuildersClubSubscriptionStatusMessageParser
} from '../communication/messages/parser/catalog/BuildersClubSubscriptionStatusMessageParser';

const log = Logger.getLogger('Session');

/**
 * Session data manager
 * Manages user session data after authentication
 * Based on AS3 com.sulake.habbo.session.SessionDataManager
 */
export class SessionDataManager extends EventEmitter<SessionDataManagerEvents> implements ISessionDataManager {
    private _communication: IHabboCommunicationManager;
    private _messageEvents: IMessageEvent[] = [];
    private _disposed: boolean = false;
    private _customData: string = '';
    private _isFirstLoginOfDay: boolean = false;
    // Other
    private _directMail: boolean = false;
    // Info feed
    private _infoFeedEnabled: boolean = false;
    // Figure sets
    private _figureSetIds: number[] = [];
    private _boundFurnitureNames: string[] = [];
    // Avatar effects
    private _avatarEffects: AvatarEffect[] = [];
    // Mystery box
    private _mysteryBoxColor: string = '';
    private _mysteryBoxKeyColor: string = '';
    // Builders club
    private _buildersClubSecondsLeft: number = 0;
    private _buildersClubFurniLimit: number = 0;
    private _buildersClubMaxFurniLimit: number = 0;
    private _buildersClubSecondsLeftWithGrace: number | null = null;

    constructor(communication: IHabboCommunicationManager) {
        super();
        this._communication = communication;
        this.registerMessageEvents();
        log.info('SessionDataManager initialized');
    }

    // System status
    private _systemOpen: boolean = false;

    get systemOpen(): boolean {
        return this._systemOpen;
    }

    private _systemShutDown: boolean = false;

    get systemShutDown(): boolean {
        return this._systemShutDown;
    }

    private _isAuthenticHabbo: boolean = false;

    get isAuthenticHabbo(): boolean {
        return this._isAuthenticHabbo;
    }

    // User data
    private _userId: number = 0;

    get userId(): number {
        return this._userId;
    }

    private _userName: string = '';

    get userName(): string {
        return this._userName;
    }

    private _realName: string = '';

    get realName(): string {
        return this._realName;
    }

    private _figure: string = '';

    get figure(): string {
        return this._figure;
    }

    private _gender: string = '';

    get gender(): string {
        return this._gender;
    }

    // User status
    private _clubLevel: number = 0;

    get clubLevel(): number {
        return this._clubLevel;
    }

    private _securityLevel: number = 0;

    get securityLevel(): number {
        return this._securityLevel;
    }

    private _isAmbassador: boolean = false;

    get isAmbassador(): boolean {
        return this._isAmbassador;
    }

    private _noobnessLevel: number = 0;

    get noobnessLevel(): number {
        return this._noobnessLevel;
    }

    // Respect
    private _respectTotal: number = 0;

    get respectTotal(): number {
        return this._respectTotal;
    }

    private _respectLeft: number = 0;

    // ========== Event Handlers ==========

    get respectLeft(): number {
        return this._respectLeft;
    }

    private _petRespectLeft: number = 0;

    get petRespectLeft(): number {
        return this._petRespectLeft;
    }

    private _streamPublishingAllowed: boolean = false;

    get streamPublishingAllowed(): boolean {
        return this._streamPublishingAllowed;
    }

    private _lastAccessDate: string = '';

    get lastAccessDate(): string {
        return this._lastAccessDate;
    }

    private _nameChangeAllowed: boolean = false;

    get nameChangeAllowed(): boolean {
        return this._nameChangeAllowed;
    }

    private _accountSafetyLocked: boolean = false;

    get accountSafetyLocked(): boolean {
        return this._accountSafetyLocked;
    }

    // Navigator settings
    private _homeRoomId: number = 0;

    // Navigator settings
    get homeRoomId(): number {
        return this._homeRoomId;
    }

    private _roomIdToEnter: number = 0;

    get roomIdToEnter(): number {
        return this._roomIdToEnter;
    }

    // ========== Getters ==========

    private _favouriteRooms: number[] = [];

    get favouriteRooms(): number[] {
        return this._favouriteRooms;
    }

    private _favouriteRoomsLimit: number = 30;

    get favouriteRoomsLimit(): number {
        return this._favouriteRoomsLimit;
    }

    // Currency
    private _activityPoints: Map<number, number> = new Map();

    // Currency
    get activityPoints(): Map<number, number> {
        return this._activityPoints;
    }

    private _achievementScore: number = 0;

    get achievementScore(): number {
        return this._achievementScore;
    }

    get hasVip(): boolean {
        return this._clubLevel >= HabboClubLevelEnum.VIP;
    }

    get hasClub(): boolean {
        return this._clubLevel >= HabboClubLevelEnum.CLUB;
    }

    get isNoob(): boolean {
        return this._noobnessLevel > 0;
    }

    get isRealNoob(): boolean {
        return this._noobnessLevel === 2;
    }

    get safetyLocked(): boolean {
        return this._accountSafetyLocked;
    }

    get canChangeName(): boolean {
        return this._nameChangeAllowed;
    }

    get motto(): string {
        return this._customData;
    }

    get respectsReceived(): number {
        return this._respectTotal;
    }

    get respectsRemaining(): number {
        return this._respectLeft;
    }

    get respectsPetRemaining(): number {
        return this._petRespectLeft;
    }

    // Event emitter access for UIBridge
    get events(): EventEmitter<SessionDataManagerEvents> {
        return this;
    }

    /**
     * Check if user has a specific security level
     */
    hasSecurity(level: number): boolean {
        return this._securityLevel >= level;
    }

    /**
     * Dispose of the session data manager
     */
    dispose(): void {
        if (this._disposed) return;

        // Remove all message event handlers
        for (const event of this._messageEvents) {
            this._communication.removeMessageEvent(event);
        }
        this._messageEvents = [];

        this.removeAllListeners();
        this._disposed = true;

        log.info('SessionDataManager disposed');
    }

    /**
     * Register message event handlers
     */
    private registerMessageEvents(): void {
        // User data events
        this.addMessageEvent(new UserObjectMessageEvent(this.onUserObject.bind(this)));
        this.addMessageEvent(new UserRightsMessageEvent(this.onUserRights.bind(this)));
        this.addMessageEvent(new NoobnessLevelMessageEvent(this.onNoobnessLevel.bind(this)));
        this.addMessageEvent(new IsFirstLoginOfDayMessageEvent(this.onIsFirstLoginOfDay.bind(this)));

        // Availability events
        this.addMessageEvent(new AvailabilityStatusMessageEvent(this.onAvailabilityStatus.bind(this)));

        // Avatar events
        this.addMessageEvent(new FigureUpdateMessageEvent(this.onFigureUpdate.bind(this)));

        // Navigator events
        this.addMessageEvent(new NavigatorSettingsMessageEvent(this.onNavigatorSettings.bind(this)));
        this.addMessageEvent(new FavouritesMessageEvent(this.onFavourites.bind(this)));

        // Notifications events
        this.addMessageEvent(new ActivityPointsMessageEvent(this.onActivityPoints.bind(this)));
        this.addMessageEvent(new InfoFeedEnableMessageEvent(this.onInfoFeedEnable.bind(this)));

        // Inventory events
        this.addMessageEvent(new AchievementsScoreMessageEvent(this.onAchievementsScore.bind(this)));
        this.addMessageEvent(new FigureSetIdsMessageEvent(this.onFigureSetIds.bind(this)));
        this.addMessageEvent(new AvatarEffectsMessageEvent(this.onAvatarEffects.bind(this)));

        // Mystery box events
        this.addMessageEvent(new MysteryBoxKeysMessageEvent(this.onMysteryBoxKeys.bind(this)));

        // Catalog events
        this.addMessageEvent(new BuildersClubSubscriptionStatusMessageEvent(this.onBuildersClubStatus.bind(this)));
    }

    /**
     * Add a message event handler
     */
    private addMessageEvent(event: IMessageEvent): void {
        this._communication.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    /**
     * Handle user object event
     * Contains main user data after login
     */
    private onUserObject(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as UserObjectMessageParser;

        if(!parser) return;

        this._userId = parser.id;
        this._userName = parser.name;
        this._realName = parser.realName;
        this._figure = parser.figure;
        this._gender = parser.sex;
        this._customData = parser.customData;
        this._directMail = parser.directMail;
        this._respectTotal = parser.respectTotal;
        this._respectLeft = parser.respectLeft;
        this._petRespectLeft = parser.petRespectLeft;
        this._streamPublishingAllowed = parser.streamPublishingAllowed;
        this._lastAccessDate = parser.lastAccessDate;
        this._nameChangeAllowed = parser.nameChangeAllowed;
        this._accountSafetyLocked = parser.accountSafetyLocked;

        log.success(`User loaded: ${this._userName} (ID: ${this._userId})`);

        this.emit('userDataUpdated');
    }

    /**
     * Handle user rights event
     * Contains club level and security permissions
     */
    private onUserRights(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as UserRightsMessageParser;

        if(!parser) return;

        this._clubLevel = parser.clubLevel;
        this._securityLevel = parser.securityLevel;
        this._isAmbassador = parser.isAmbassador;

        log.debug(`Rights: Club=${this._clubLevel}, Security=${this._securityLevel}, Ambassador=${this._isAmbassador}`);

        this.emit('userRightsUpdated');
    }

    /**
     * Handle noobness level event
     * Indicates if user is new
     */
    private onNoobnessLevel(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as NoobnessLevelMessageParser;

        if(!parser) return;

        this._noobnessLevel = parser.noobnessLevel;

        log.debug(`Noobness level: ${this._noobnessLevel}`);
    }

    /**
     * Handle availability status event
     * Indicates hotel open/shutdown status
     */
    private onAvailabilityStatus(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as AvailabilityStatusMessageParser;

        if(!parser) return;

        this._systemOpen = parser.isOpen;
        this._systemShutDown = parser.onShutDown;
        this._isAuthenticHabbo = parser.isAuthenticHabbo;

        log.debug(`Availability: Open=${this._systemOpen}, ShutDown=${this._systemShutDown}`);

        this.emit('availabilityStatusUpdated', this._systemOpen, this._systemShutDown);
    }

    /**
     * Handle figure update event
     * Sent when avatar appearance changes
     */
    private onFigureUpdate(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as FigureUpdateMessageParser;

        if(!parser) return;

        this._figure = parser.figure;
        this._gender = parser.gender;

        log.debug(`Figure updated: ${this._figure}`);

        this.emit('figureUpdated', this._figure, this._gender);
    }

    /**
     * Handle first login of day event
     */
    private onIsFirstLoginOfDay(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as IsFirstLoginOfDayMessageParser;

        if(!parser) return;

        this._isFirstLoginOfDay = parser.isFirstLoginOfDay;

        log.debug(`First login of day: ${this._isFirstLoginOfDay}`);
    }

    /**
     * Handle navigator settings event
     */
    private onNavigatorSettings(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as NavigatorSettingsMessageParser;

        if(!parser) return;

        this._homeRoomId = parser.homeRoomId;
        this._roomIdToEnter = parser.roomIdToEnter;

        log.debug(`Navigator: HomeRoom=${this._homeRoomId}, RoomToEnter=${this._roomIdToEnter}`);

        this.emit('navigatorSettingsUpdated');
    }

    /**
     * Handle favourites event
     */
    private onFavourites(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as FavouritesMessageParser;

        if(!parser) return;

        this._favouriteRoomsLimit = parser.limit;
        this._favouriteRooms = [...parser.favouriteRoomIds];

        log.debug(`Favourites: ${this._favouriteRooms.length}/${this._favouriteRoomsLimit}`);

        this.emit('favouritesUpdated');
    }

    /**
     * Handle activity points event
     */
    private onActivityPoints(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as ActivityPointsMessageParser;

        if(!parser) return;

        this._activityPoints = new Map(parser.points);

        log.debug(`Activity points: ${this._activityPoints.size} types`);

        this.emit('activityPointsUpdated');
    }

    /**
     * Handle info feed enable event
     */
    private onInfoFeedEnable(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as InfoFeedEnableMessageParser;

        if(!parser) return;

        this._infoFeedEnabled = parser.enabled;

        log.debug(`Info feed enabled: ${this._infoFeedEnabled}`);
    }

    /**
     * Handle achievements score event
     */
    private onAchievementsScore(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as AchievementsScoreMessageParser;

        if(!parser) return;

        this._achievementScore = parser.score;

        log.debug(`Achievement score: ${this._achievementScore}`);

        this.emit('achievementScoreUpdated');
    }

    /**
     * Handle figure set ids event
     */
    private onFigureSetIds(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as FigureSetIdsMessageParser;

        if(!parser) return;

        this._figureSetIds = [...parser.figureSetIds];
        this._boundFurnitureNames = [...parser.boundFurnitureNames];

        log.debug(`Figure sets: ${this._figureSetIds.length}, Bound furniture: ${this._boundFurnitureNames.length}`);
    }

    /**
     * Handle avatar effects event
     */
    private onAvatarEffects(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as AvatarEffectsMessageParser;

        if(!parser) return;

        this._avatarEffects = [...parser.effects];

        log.debug(`Avatar effects: ${this._avatarEffects.length}`);
    }

    /**
     * Handle mystery box keys event
     */
    private onMysteryBoxKeys(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as MysteryBoxKeysMessageParser;

        if(!parser) return;

        this._mysteryBoxColor = parser.boxColor;
        this._mysteryBoxKeyColor = parser.keyColor;

        log.debug(`Mystery box: color=${this._mysteryBoxColor}, keyColor=${this._mysteryBoxKeyColor}`);
    }

    /**
     * Handle builders club subscription status event
     */
    private onBuildersClubStatus(event: IMessageEvent): void {
        if (!event) return;

        const parser = event.parser as BuildersClubSubscriptionStatusMessageParser;

        if(!parser) return;

        this._buildersClubSecondsLeft = parser.secondsLeft;
        this._buildersClubFurniLimit = parser.furniLimit;
        this._buildersClubMaxFurniLimit = parser.maxFurniLimit;
        this._buildersClubSecondsLeftWithGrace = parser.secondsLeftWithGrace;

        log.debug(`Builders club: ${this._buildersClubSecondsLeft}s left, furni ${this._buildersClubFurniLimit}/${this._buildersClubMaxFurniLimit}`);
    }
}
