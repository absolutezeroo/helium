import type {IConnection} from '@core/communication/connection/IConnection';
import type {IRoomSession, RoomSessionStateType} from './IRoomSession';
import {RoomSessionState} from './IRoomSession';
import type {RoomModerationSettings} from '../communication/messages/incoming/navigator';
import {
	AmbassadorAlertMessageComposer,
	AssignRightsMessageComposer,
	AvatarExpressionMessageComposer,
	BanUserWithDurationMessageComposer,
	CancelTypingMessageComposer,
	ChangeMottoMessageComposer,
	ChangePostureMessageComposer,
	ChangeQueueMessageComposer,
	ChatMessageComposer,
	CompostPlantComposer,
	CreditFurniRedeemMessageComposer,
	DanceMessageComposer,
	DismountPetComposer,
	GetPetCommandsComposer,
	HarvestPetComposer,
	KickUserMessageComposer,
	LetUserInMessageComposer,
	MountPetComposer,
	MuteUserMessageComposer,
	OpenFlatConnectionMessageComposer,
	OpenPetPackageMessageComposer,
	PickUpPetComposer,
	PresentOpenMessageComposer,
	QuitMessageComposer,
	RemoveRightsMessageComposer,
	RemoveSaddleFromPetComposer,
	RoomDimmerChangeStateComposer,
	RoomDimmerGetPresetsComposer,
	RoomDimmerSavePresetComposer,
	ShoutMessageComposer,
	SignMessageComposer,
	StartTypingMessageComposer,
	TogglePetBreedingPermissionComposer,
	TogglePetRidingPermissionComposer,
	UnmuteUserMessageComposer,
	UpdateClothingChangeFurnitureComposer,
	UseProductForPetComposer,
	WhisperMessageComposer,
} from '../communication/messages/outgoing/room';
import {PollAnswerComposer, PollRejectComposer, PollStartComposer,} from '../communication/messages/outgoing/poll';
import {VisitUserMessageComposer,} from '../communication/messages/outgoing/friendlist';
import {EventLogMessageComposer,} from '../communication/messages/outgoing';

/**
 * Ban duration types
 */
export const BanDuration = {
	HOUR: 'RWUAM_BAN_USER_HOUR',
	DAY: 'RWUAM_BAN_USER_DAY',
	PERMANENT: 'RWUAM_BAN_USER_PERM',
} as const;

/**
 * Room session implementation
 *
 * Based on AS3: com.sulake.habbo.session.RoomSession
 *
 * Represents an active session in a room. The key method is start()
 * which sends OpenFlatConnectionMessageComposer to enter the room.
 *
 * @see source_as/habbo/session/RoomSession.as
 */
export class RoomSession implements IRoomSession
{
	private _chatTrackingId: number = 0;
	private _chatTrackingMap: Map<number, number> = new Map();
	private _eventLogTracked: Map<string, boolean> = new Map();

	private _connection: IConnection | null = null;

	get connection(): IConnection | null
	{
		return this._connection;
	}

	set connection(value: IConnection | null)
	{
		this._connection = value;
	}

	private _roomId: number = 0;

	get roomId(): number
	{
		return this._roomId;
	}

	set roomId(value: number)
	{
		this._roomId = value;
	}

	private _roomPassword: string = '';

	get roomPassword(): string
	{
		return this._roomPassword;
	}

	set roomPassword(value: string)
	{
		this._roomPassword = value;
	}

	private _roomResources: string = '';

	get roomResources(): string
	{
		return this._roomResources;
	}

	set roomResources(value: string)
	{
		this._roomResources = value;
	}

	private _state: RoomSessionStateType = RoomSessionState.CREATED;

	get state(): RoomSessionStateType
	{
		return this._state;
	}

	// Session properties
	private _ownUserRoomId: number = -1;

	get ownUserRoomId(): number
	{
		return this._ownUserRoomId;
	}

	set ownUserRoomId(value: number)
	{
		this._ownUserRoomId = value;
	}

	private _isRoomOwner: boolean = false;

	get isRoomOwner(): boolean
	{
		return this._isRoomOwner;
	}

	set isRoomOwner(value: boolean)
	{
		this._isRoomOwner = value;
	}

	private _roomControllerLevel: number = 0;

	get roomControllerLevel(): number
	{
		return this._roomControllerLevel;
	}

	set roomControllerLevel(value: number)
	{
		if (value >= 0 && value <= 5)
		{
			this._roomControllerLevel = value;
		}
	}

	private _isGuildRoom: boolean = false;

	get isGuildRoom(): boolean
	{
		return this._isGuildRoom;
	}

	set isGuildRoom(value: boolean)
	{
		this._isGuildRoom = value;
	}

	get isPrivateRoom(): boolean
	{
		return true;
	}

	private _tradeMode: number = 0;

	get tradeMode(): number
	{
		return this._tradeMode;
	}

	set tradeMode(value: number)
	{
		this._tradeMode = value;
	}

	private _doorMode: number = 0;

	get doorMode(): number
	{
		return this._doorMode;
	}

	set doorMode(value: number)
	{
		this._doorMode = value;
	}

	get isNoobRoom(): boolean
	{
		return this._doorMode === 4;
	}

	private _isSpectatorMode: boolean = false;

	get isSpectatorMode(): boolean
	{
		return this._isSpectatorMode;
	}

	set isSpectatorMode(value: boolean)
	{
		this._isSpectatorMode = value;
	}

	private _arePetsAllowed: boolean = false;

	get arePetsAllowed(): boolean
	{
		return this._arePetsAllowed;
	}

	set arePetsAllowed(value: boolean)
	{
		this._arePetsAllowed = value;
	}

	get areBotsAllowed(): boolean
	{
		return this._isRoomOwner;
	}

	private _roomModerationSettings: RoomModerationSettings | null = null;

	get roomModerationSettings(): RoomModerationSettings | null
	{
		return this._roomModerationSettings;
	}

	set roomModerationSettings(value: RoomModerationSettings | null)
	{
		this._roomModerationSettings = value;
	}

	private _isUserDecorating: boolean = false;

	get isUserDecorating(): boolean
	{
		return this._isUserDecorating;
	}

	set isUserDecorating(value: boolean)
	{
		this._isUserDecorating = value;
	}

	private _isGameSession: boolean = false;

	get isGameSession(): boolean
	{
		return this._isGameSession;
	}

	set isGameSession(value: boolean)
	{
		this._isGameSession = value;
	}

	private _playTestMode: boolean = false;

	get playTestMode(): boolean
	{
		return this._playTestMode;
	}

	set playTestMode(value: boolean)
	{
		this._playTestMode = value;
	}

	private _isNuxNotComplete: boolean = false;

	get isNuxNotComplete(): boolean
	{
		return this._isNuxNotComplete;
	}

	set isNuxNotComplete(value: boolean)
	{
		this._isNuxNotComplete = value;
	}

	/**
	 * Start the room session
	 * Sends OpenFlatConnectionMessageComposer to the server
	 */
	start(): boolean
	{
		if (this._state !== RoomSessionState.CREATED || this._connection === null)
		{
			return false;
		}

		this._state = RoomSessionState.STARTED;

		this._connection.send(new OpenFlatConnectionMessageComposer(this._roomId, this._roomPassword));

		return true;
	}

	/**
	 * Reset the session with a new room ID
	 * Called when session is reinitialized (e.g., room forwarding)
	 */
	reset(newRoomId: number): void
	{
		if (newRoomId !== this._roomId)
		{
			this._roomId = newRoomId;
			this._isRoomOwner = false;
			this._roomControllerLevel = 0;
			this._tradeMode = 0;
			this._isSpectatorMode = false;
		}
	}

	/**
	 * Quit the current room session
	 */
	quit(): void
	{
		if (this._connection === null)
		{
			return;
		}

		this._connection.send(new QuitMessageComposer());
	}

	/**
	 * Dispose the session and clean up resources
	 */
	dispose(): void
	{
		this._connection = null;
		this._state = RoomSessionState.ENDED;
		this._chatTrackingMap.clear();
		this._eventLogTracked.clear();
	}

	// ========== Chat Methods ==========

	sendChatMessage(message: string, styleId: number = 0): void
	{
		if (this._connection === null) return;

		this._chatTrackingMap.set(this._chatTrackingId, Date.now());
		this._connection.send(new ChatMessageComposer(message, styleId, this._chatTrackingId));
		this._chatTrackingId++;
	}

	sendChangeMottoMessage(motto: string): void
	{
		if (this._connection === null) return;
		this._connection.send(new ChangeMottoMessageComposer(motto));
	}

	sendShoutMessage(message: string, styleId: number = 0): void
	{
		if (this._connection === null) return;
		this._connection.send(new ShoutMessageComposer(message, styleId));
	}

	sendWhisperMessage(recipientName: string, message: string, styleId: number = 0): void
	{
		if (this._connection === null) return;
		// Note: WhisperMessageComposer takes message, styleId, targetUserId
		// But the interface takes recipientName - would need UserDataManager to resolve
		this._connection.send(new WhisperMessageComposer(message, styleId, -1));
	}

	sendChatTypingMessage(isTyping: boolean): void
	{
		if (this._connection === null) return;

		if (isTyping)
		{
			this._connection.send(new StartTypingMessageComposer());
		}
		else
		{
			this._connection.send(new CancelTypingMessageComposer());
		}
	}

	receivedChatWithTrackingId(trackingId: number): void
	{
		this._chatTrackingMap.delete(trackingId);
	}

	// ========== Avatar Methods ==========

	sendAvatarExpressionMessage(expressionId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new AvatarExpressionMessageComposer(expressionId));
	}

	sendSignMessage(signId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new SignMessageComposer(signId));
	}

	sendDanceMessage(danceId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new DanceMessageComposer(danceId));
	}

	sendChangePostureMessage(posture: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new ChangePostureMessageComposer(posture));
	}

	// ========== Furniture Methods ==========

	sendCreditFurniRedeemMessage(objectId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new CreditFurniRedeemMessageComposer(objectId));
	}

	sendPresentOpenMessage(objectId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new PresentOpenMessageComposer(objectId));
	}

	sendOpenPetPackageMessage(objectId: number, name: string): void
	{
		if (this._connection === null) return;
		this._connection.send(new OpenPetPackageMessageComposer(objectId, name));
	}

	sendRoomDimmerGetPresetsMessage(_itemId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new RoomDimmerGetPresetsComposer());
	}

	sendRoomDimmerSavePresetMessage(_itemId: number, presetId: number, type: number, color: number, light: boolean, brightness: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new RoomDimmerSavePresetComposer(presetId, type, color, brightness, light));
	}

	sendRoomDimmerChangeStateMessage(_itemId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new RoomDimmerChangeStateComposer());
	}

	sendUpdateClothingChangeFurniture(objectId: number, gender: string, figure: string): void
	{
		if (this._connection === null) return;
		this._connection.send(new UpdateClothingChangeFurnitureComposer(objectId, gender, figure));
	}

	// ========== Poll Methods ==========

	sendPollStartMessage(pollId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new PollStartComposer(pollId));
	}

	sendPollRejectMessage(pollId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new PollRejectComposer(pollId));
	}

	sendPollAnswerMessage(pollId: number, questionId: number, answers: string[]): void
	{
		if (this._connection === null) return;
		this._connection.send(new PollAnswerComposer(pollId, questionId, answers));
	}

	// ========== Tracking Methods ==========

	sendConversionPoint(type: string, value: string, extra: string, category: string | null = null, action: number = 0): void
	{
		if (this._connection === null) return;
		this._connection.send(new EventLogMessageComposer(type, value, extra, category ?? '', action));
	}

	sendPeerUsersClassificationMessage(_data: string): void
	{
		// TODO: PeerUsersClassificationMessageComposer
	}

	sendRoomUsersClassificationMessage(_data: string): void
	{
		// TODO: RoomUsersClassificationMessageComposer
	}

	// ========== Navigation Methods ==========

	sendVisitFlatMessage(roomId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new OpenFlatConnectionMessageComposer(roomId, ''));
	}

	sendVisitUserMessage(userName: string): void
	{
		if (this._connection === null) return;
		this._connection.send(new VisitUserMessageComposer(userName));
	}

	// ========== Moderation Methods ==========

	ambassadorAlert(userId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new AmbassadorAlertMessageComposer(userId));
	}

	kickUser(userId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new KickUserMessageComposer(userId));
	}

	banUserWithDuration(userId: number, duration: string): void
	{
		if (this._connection === null) return;

		let banType: number;
		switch (duration)
		{
			case BanDuration.HOUR:
				banType = 1;
				break;
			case BanDuration.DAY:
				banType = 2;
				break;
			case BanDuration.PERMANENT:
			default:
				banType = 0;
				break;
		}

		this._connection.send(new BanUserWithDurationMessageComposer(userId, banType, this._roomId));
	}

	muteUser(userId: number, minutes: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new MuteUserMessageComposer(userId, minutes, this._roomId));
	}

	unmuteUser(userId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new UnmuteUserMessageComposer(userId, this._roomId));
	}

	// ========== Rights Methods ==========

	assignRights(userId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new AssignRightsMessageComposer(userId));
	}

	removeRights(userId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new RemoveRightsMessageComposer([userId]));
	}

	letUserIn(userName: string, allow: boolean): void
	{
		if (this._connection === null) return;
		this._connection.send(new LetUserInMessageComposer(userName, allow));
	}

	// ========== Pet Methods ==========

	pickUpPet(petId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new PickUpPetComposer(petId));
	}

	mountPet(petId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new MountPetComposer(petId));
	}

	togglePetRidingPermission(petId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new TogglePetRidingPermissionComposer(petId));
	}

	dismountPet(petId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new DismountPetComposer(petId));
	}

	removeSaddleFromPet(petId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new RemoveSaddleFromPetComposer(petId));
	}

	requestPetCommands(petId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new GetPetCommandsComposer(petId));
	}

	useProductForPet(petId: number, productId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new UseProductForPetComposer(petId, productId));
	}

	plantSeed(itemId: number): void
	{
		if (this._connection === null) return;
		// TODO: UseFurnitureMessageComposer
	}

	harvestPet(petId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new HarvestPetComposer(petId));
	}

	togglePetBreedingPermission(petId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new TogglePetBreedingPermissionComposer(petId));
	}

	compostPlant(petId: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new CompostPlantComposer(petId));
	}

	// ========== Queue Methods ==========

	changeQueue(targetQueue: number): void
	{
		if (this._connection === null) return;
		this._connection.send(new ChangeQueueMessageComposer(targetQueue));
	}

	// ========== NUX Methods ==========

	sendScriptProceed(): void
	{
		// TODO: NewUserExperienceScriptProceedComposer
	}

	// ========== Event Logging ==========

	trackEventLogOncePerSession(category: string, type: string, action: string): void
	{
		const key = `${category}_${type}_${action}`;
		if (this._eventLogTracked.has(key))
		{
			return;
		}
		this._eventLogTracked.set(key, true);
		this.sendConversionPoint(category, type, action);
	}
}
