import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {ISessionDataManager} from './ISessionDataManager';
import {HabboClubLevelEnum, UIFlagsEnum} from './enum';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";

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
import {InClientLinkMessageEvent} from '../communication/messages/incoming/users/InClientLinkMessageEvent';

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
import type {InClientLinkMessageParser} from '../communication/messages/parser/users/InClientLinkMessageParser';

// Composers
import {RespectUserMessageComposer} from '../communication/messages/outgoing/room/RespectUserMessageComposer';
import {RespectPetMessageComposer} from '../communication/messages/outgoing/room/RespectPetMessageComposer';
import {ChatMessageComposer} from '../communication/messages/outgoing/room/chat/ChatMessageComposer';

// Sub-managers
import type {IUserDataManager} from './IUserDataManager';
import type {IPerkManager} from './IPerkManager';
import type {IIgnoredUsersManager} from './IIgnoredUsersManager';
import type {IHabboGroupInfoManager} from './IHabboGroupInfoManager';
import {UserDataManager} from './UserDataManager';
import {PerkManager} from './PerkManager';
import {IgnoredUsersManager} from './IgnoredUsersManager';
import {HabboGroupInfoManager} from './HabboGroupInfoManager';

const log = Logger.getLogger('Session');

/**
 * Session data manager
 * Manages user session data after authentication
 * Based on AS3 com.sulake.habbo.session.SessionDataManager
 */
export class SessionDataManager extends Component implements ISessionDataManager
{
	private _communicationManager: IHabboCommunicationManager | null = null;
	private _messageEvents: IMessageEvent[] = [];
	private _customData: string = '';
	private _directMail: boolean = false;
	private _mysteryBoxKeyColor: string = '';

	constructor(context: IContext)
	{
		super(context);
	}

	// Sub-managers
	private _userDataManager: UserDataManager | null = null;

	get userDataManager(): IUserDataManager
	{
		return this._userDataManager!;
	}

	private _perkManager: PerkManager | null = null;

	get perkManager(): IPerkManager
	{
		return this._perkManager!;
	}

	private _ignoredUsersManager: IgnoredUsersManager | null = null;

	get ignoredUsersManager(): IIgnoredUsersManager
	{
		return this._ignoredUsersManager!;
	}

	private _groupInfoManager: HabboGroupInfoManager | null = null;

	get groupInfoManager(): IHabboGroupInfoManager
	{
		return this._groupInfoManager!;
	}

	// System status
	private _systemOpen: boolean = false;

	get systemOpen(): boolean
	{
		return this._systemOpen;
	}

	private _systemShutDown: boolean = false;

	get systemShutDown(): boolean
	{
		return this._systemShutDown;
	}

	private _isAuthenticHabbo: boolean = false;

	get isAuthenticHabbo(): boolean
	{
		return this._isAuthenticHabbo;
	}

	// User data
	private _userId: number = 0;

	get userId(): number
	{
		return this._userId;
	}

	private _userName: string = '';

	get userName(): string
	{
		return this._userName;
	}

	private _realName: string = '';

	get realName(): string
	{
		return this._realName;
	}

	private _figure: string = '';

	get figure(): string
	{
		return this._figure;
	}

	private _gender: string = '';

	get gender(): string
	{
		return this._gender;
	}

	// User status
	private _clubLevel: number = 0;

	get clubLevel(): number
	{
		return this._clubLevel;
	}

	private _securityLevel: number = 0;

	get securityLevel(): number
	{
		return this._securityLevel;
	}

	private _topSecurityLevel: number = 0;

	get topSecurityLevel(): number
	{
		return this._topSecurityLevel;
	}

	private _isAmbassador: boolean = false;

	get isAmbassador(): boolean
	{
		return this._isAmbassador;
	}

	private _noobnessLevel: number = 0;

	get noobnessLevel(): number
	{
		return this._noobnessLevel;
	}

	// Respect
	private _respectTotal: number = 0;

	get respectTotal(): number
	{
		return this._respectTotal;
	}

	private _respectLeft: number = 0;

	get respectLeft(): number
	{
		return this._respectLeft;
	}

	private _petRespectLeft: number = 0;

	get petRespectLeft(): number
	{
		return this._petRespectLeft;
	}

	// Safety & Verification
	private _accountSafetyLocked: boolean = false;

	get accountSafetyLocked(): boolean
	{
		return this._accountSafetyLocked;
	}

	private _nameChangeAllowed: boolean = false;

	get nameChangeAllowed(): boolean
	{
		return this._nameChangeAllowed;
	}

	private _isEmailVerified: boolean = false;

	get isEmailVerified(): boolean
	{
		return this._isEmailVerified;
	}

	// Stream & Access
	private _streamPublishingAllowed: boolean = false;

	get streamPublishingAllowed(): boolean
	{
		return this._streamPublishingAllowed;
	}

	private _lastAccessDate: string = '';

	get lastAccessDate(): string
	{
		return this._lastAccessDate;
	}

	private _isFirstLoginOfDay: boolean = false;

	get isFirstLoginOfDay(): boolean
	{
		return this._isFirstLoginOfDay;
	}

	// Navigator settings
	private _homeRoomId: number = 0;

	get homeRoomId(): number
	{
		return this._homeRoomId;
	}

	private _roomIdToEnter: number = 0;

	get roomIdToEnter(): number
	{
		return this._roomIdToEnter;
	}

	private _favouriteRooms: number[] = [];

	get favouriteRooms(): number[]
	{
		return this._favouriteRooms;
	}

	private _favouriteRoomsLimit: number = 30;

	get favouriteRoomsLimit(): number
	{
		return this._favouriteRoomsLimit;
	}

	// Currency & Achievements
	private _activityPoints: Map<number, number> = new Map();

	get activityPoints(): Map<number, number>
	{
		return this._activityPoints;
	}

	private _achievementScore: number = 0;

	get achievementScore(): number
	{
		return this._achievementScore;
	}

	// UI Preferences
	private _uiFlags: number = 0;

	get uiFlags(): number
	{
		return this._uiFlags;
	}

	private _isRoomCameraFollowDisabled: boolean = false;

	get isRoomCameraFollowDisabled(): boolean
	{
		return this._isRoomCameraFollowDisabled;
	}

	private _infoFeedEnabled: boolean = false;

	get infoFeedEnabled(): boolean
	{
		return this._infoFeedEnabled;
	}

	// Figure & Effects
	private _figureSetIds: number[] = [];

	get figureSetIds(): number[]
	{
		return this._figureSetIds;
	}

	private _boundFurnitureNames: string[] = [];

	get boundFurnitureNames(): string[]
	{
		return this._boundFurnitureNames;
	}

	private _avatarEffects: AvatarEffect[] = [];

	get avatarEffects(): AvatarEffect[]
	{
		return this._avatarEffects;
	}

	// Mystery Box
	private _mysteryBoxColor: string = '';

	get mysteryBoxColor(): string
	{
		return this._mysteryBoxColor;
	}

	// Builders Club
	private _buildersClubSecondsLeft: number = 0;

	get buildersClubSecondsLeft(): number
	{
		return this._buildersClubSecondsLeft;
	}

	private _buildersClubFurniLimit: number = 0;

	get buildersClubFurniLimit(): number
	{
		return this._buildersClubFurniLimit;
	}

	private _buildersClubMaxFurniLimit: number = 0;

	get buildersClubMaxFurniLimit(): number
	{
		return this._buildersClubMaxFurniLimit;
	}

	private _buildersClubSecondsLeftWithGrace: number | null = null;

	get buildersClubSecondsLeftWithGrace(): number | null
	{
		return this._buildersClubSecondsLeftWithGrace;
	}

	get motto(): string
	{
		return this._customData;
	}

	get hasVip(): boolean
	{
		return this._clubLevel >= HabboClubLevelEnum.VIP;
	}

	get hasClub(): boolean
	{
		return this._clubLevel >= HabboClubLevelEnum.CLUB;
	}

	get isNoob(): boolean
	{
		return this._noobnessLevel > 0;
	}

	get isRealNoob(): boolean
	{
		return this._noobnessLevel === 2;
	}

	get isAnyRoomController(): boolean
	{
		return this._securityLevel >= 5;
	}

	get canChangeName(): boolean
	{
		return this._nameChangeAllowed;
	}

	get respectsReceived(): number
	{
		return this._respectTotal;
	}

	get respectsRemaining(): number
	{
		return this._respectLeft;
	}

	get respectsPetRemaining(): number
	{
		return this._petRespectLeft;
	}

	get safetyLocked(): boolean
	{
		return this._accountSafetyLocked;
	}

	get mysteryKeyColor(): string
	{
		return this._mysteryBoxKeyColor;
	}

	get perksReady(): boolean
	{
		return this._perkManager?.isReady ?? false;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communicationManager = manager;
				},
				true
			),
		];
	}

	/**
	 * Check if a user has a specific security level
	 */
	hasSecurity(level: number): boolean
	{
		return this._securityLevel >= level;
	}

	/**
	 * Send a message to the server
	 */
	send(composer: IMessageComposer<unknown[]>): void
	{
		this._communicationManager?.connection?.send(composer);
	}

	/**
	 * Give respect to a user
	 */
	giveRespect(userId: number): void
	{
		if (userId >= 0 && this._respectLeft > 0)
		{
			this.send(new RespectUserMessageComposer(userId));
			this._respectLeft--;
		}
	}

	/**
	 * Give respect to a pet
	 */
	givePetRespect(petId: number): void
	{
		if (petId >= 0 && this._petRespectLeft > 0)
		{
			this.send(new RespectPetMessageComposer(petId));
			this._petRespectLeft--;
		}
	}

	/**
	 * Called when giving respect fails - restore the counter
	 */
	giveRespectFailed(): void
	{
		this._respectLeft++;
	}

	/**
	 * Set room camera follow the disabled preference
	 */
	setRoomCameraFollowDisabled(disabled: boolean): void
	{
		this._isRoomCameraFollowDisabled = disabled;
		// Note: In AS3 this also sends a message to save preference
	}

	/**
	 * Set friend bar state UI flag
	 */
	setFriendBarState(open: boolean): void
	{
		this.setUIFlag(UIFlagsEnum.FRIEND_BAR_OPEN, open);
	}

	// ========== Perk Shortcuts ==========

	/**
	 * Set room tools state UI flag
	 */
	setRoomToolsState(open: boolean): void
	{
		this.setUIFlag(UIFlagsEnum.ROOM_TOOLS_OPEN, open);
	}

	isPerkAllowed(perk: string): boolean
	{
		return this._perkManager?.isPerkAllowed(perk) ?? false;
	}

	getPerkErrorMessage(perk: string): string
	{
		return this._perkManager?.getPerkErrorMessage(perk) ?? '';
	}

	// ========== Ignored Users Shortcuts ==========

	isIgnored(userId: number): boolean
	{
		return this._ignoredUsersManager?.isIgnored(userId) ?? false;
	}

	ignoreUser(userId: number): void
	{
		this._ignoredUsersManager?.ignoreUser(userId);
	}

	unignoreUser(userId: number): void
	{
		this._ignoredUsersManager?.unignoreUser(userId);
	}

	// ========== Safety ==========

	isAccountSafetyLocked(): boolean
	{
		return this._accountSafetyLocked;
	}

	// ========== Special Command ==========

	sendSpecialCommandMessage(command: string): void
	{
		if (this._communicationManager?.connection)
		{
			this._communicationManager.connection.send(new ChatMessageComposer(command, 0, -1));
		}
	}

	/**
	 * Dispose of the session data manager
	 */
	override dispose(): void
	{
		if (this.disposed) return;

		// Dispose sub-managers
		this._userDataManager?.dispose();
		this._perkManager?.dispose();
		this._ignoredUsersManager?.dispose();
		this._groupInfoManager?.dispose();

		this._userDataManager = null;
		this._perkManager = null;
		this._ignoredUsersManager = null;
		this._groupInfoManager = null;

		// Remove all message event handlers
		for (const event of this._messageEvents)
		{
			this._communicationManager?.removeMessageEvent(event);
		}

		this._messageEvents = [];

		log.info('SessionDataManager disposed');

		super.dispose();
	}

	protected override initComponent(): void
	{
		// Initialize sub-managers
		const sendCallback = this.send.bind(this);

		this._userDataManager = new UserDataManager(sendCallback);
		this._perkManager = new PerkManager(this._communicationManager);
		this._ignoredUsersManager = new IgnoredUsersManager(this._communicationManager, sendCallback);
		this._groupInfoManager = new HabboGroupInfoManager(this._communicationManager, sendCallback);

		this.registerMessageEvents();

		log.info('SessionDataManager initialized');
	}

	/**
	 * Set a UI flag
	 */
	private setUIFlag(flag: number, enabled: boolean): void
	{
		if (enabled)
		{
			if (this._uiFlags & flag) return;

			this._uiFlags |= flag;
		}
		else
		{
			if (!(this._uiFlags & flag)) return;

			this._uiFlags &= ~flag;
		}
		// Note: In AS3 this sends SetUIFlagsMessageComposer
	}

	/**
	 * Register message event handlers
	 */
	private registerMessageEvents(): void
	{
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

		// Users events
		this.addMessageEvent(new InClientLinkMessageEvent(this.onInClientLink.bind(this)));
	}

	/**
	 * Add a message event handler
	 */
	private addMessageEvent(event: IMessageEvent): void
	{
		this._communicationManager!.addMessageEvent(event);
		this._messageEvents.push(event);
	}

	private onUserObject(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as UserObjectMessageParser;

		if (!parser) return;

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
	}

	private onUserRights(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as UserRightsMessageParser;

		if (!parser) return;

		this._clubLevel = parser.clubLevel;
		this._securityLevel = parser.securityLevel;
		this._isAmbassador = parser.isAmbassador;

		// Track the highest security level ever seen
		this._topSecurityLevel = Math.max(this._topSecurityLevel, parser.securityLevel);

		log.debug(`Rights: Club=${this._clubLevel}, Security=${this._securityLevel}, Ambassador=${this._isAmbassador}`);
	}

	private onNoobnessLevel(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NoobnessLevelMessageParser;

		if (!parser) return;

		this._noobnessLevel = parser.noobnessLevel;

		log.debug(`Noobness level: ${this._noobnessLevel}`);
	}

	private onAvailabilityStatus(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as AvailabilityStatusMessageParser;

		if (!parser) return;

		this._systemOpen = parser.isOpen;
		this._systemShutDown = parser.onShutDown;
		this._isAuthenticHabbo = parser.isAuthenticHabbo;

		log.debug(`Availability: Open=${this._systemOpen}, ShutDown=${this._systemShutDown}`);
	}

	private onFigureUpdate(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as FigureUpdateMessageParser;

		if (!parser) return;

		this._figure = parser.figure;
		this._gender = parser.gender;

		log.debug(`Figure updated: ${this._figure}`);
	}

	private onIsFirstLoginOfDay(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as IsFirstLoginOfDayMessageParser;

		if (!parser) return;

		this._isFirstLoginOfDay = parser.isFirstLoginOfDay;

		log.debug(`First login of day: ${this._isFirstLoginOfDay}`);
	}

	private onNavigatorSettings(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as NavigatorSettingsMessageParser;

		if (!parser) return;

		this._homeRoomId = parser.homeRoomId;
		this._roomIdToEnter = parser.roomIdToEnter;

		log.debug(`Navigator: HomeRoom=${this._homeRoomId}, RoomToEnter=${this._roomIdToEnter}`);
	}

	private onFavourites(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as FavouritesMessageParser;

		if (!parser) return;

		this._favouriteRoomsLimit = parser.limit;
		this._favouriteRooms = [...parser.favouriteRoomIds];

		log.debug(`Favourites: ${this._favouriteRooms.length}/${this._favouriteRoomsLimit}`);
	}

	private onActivityPoints(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as ActivityPointsMessageParser;

		if (!parser) return;

		this._activityPoints = new Map(parser.points);

		log.debug(`Activity points: ${this._activityPoints.size} types`);
	}

	private onInfoFeedEnable(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as InfoFeedEnableMessageParser;

		if (!parser) return;

		this._infoFeedEnabled = parser.enabled;

		log.debug(`Info feed enabled: ${this._infoFeedEnabled}`);
	}

	private onAchievementsScore(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as AchievementsScoreMessageParser;

		if (!parser) return;

		this._achievementScore = parser.score;

		log.debug(`Achievement score: ${this._achievementScore}`);
	}

	private onFigureSetIds(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as FigureSetIdsMessageParser;

		if (!parser) return;

		this._figureSetIds = [...parser.figureSetIds];
		this._boundFurnitureNames = [...parser.boundFurnitureNames];

		log.debug(`Figure sets: ${this._figureSetIds.length}, Bound furniture: ${this._boundFurnitureNames.length}`);
	}

	private onAvatarEffects(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as AvatarEffectsMessageParser;

		if (!parser) return;

		this._avatarEffects = [...parser.effects];

		log.debug(`Avatar effects: ${this._avatarEffects.length}`);
	}

	private onMysteryBoxKeys(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as MysteryBoxKeysMessageParser;

		if (!parser) return;

		this._mysteryBoxColor = parser.boxColor;
		this._mysteryBoxKeyColor = parser.keyColor;

		log.debug(`Mystery box: color=${this._mysteryBoxColor}, keyColor=${this._mysteryBoxKeyColor}`);
	}

	private onInClientLink(event: IMessageEvent): void
	{
		const parser = event.parser as InClientLinkMessageParser;

		if (!parser) return;

		this.context.createLinkEvent(parser.link);

		log.debug('InClientLink: ' + parser.link);
	}

	private onBuildersClubStatus(event: IMessageEvent): void
	{
		if (!event) return;

		const parser = event.parser as BuildersClubSubscriptionStatusMessageParser;

		if (!parser) return;

		this._buildersClubSecondsLeft = parser.secondsLeft;
		this._buildersClubFurniLimit = parser.furniLimit;
		this._buildersClubMaxFurniLimit = parser.maxFurniLimit;
		this._buildersClubSecondsLeftWithGrace = parser.secondsLeftWithGrace;

		log.debug(`Builders club: ${this._buildersClubSecondsLeft}s left, furni ${this._buildersClubFurniLimit}/${this._buildersClubMaxFurniLimit}`);
	}
}
