import type {IConnection} from '@core/communication/connection/IConnection';
import type {IRoomSession, RoomSessionStateType} from './IRoomSession';
import {RoomSessionState} from './IRoomSession';
import {OpenFlatConnectionMessageComposer} from '../communication/messages/outgoing/room/session';

/**
 * Room session implementation
 *
 * Based on AS3: com.sulake.habbo.session.RoomSession
 *
 * Represents an active session in a room. The key method is start()
 * which sends OpenFlatConnectionMessageComposer to enter the room.
 */
export class RoomSession implements IRoomSession
{
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

	private _tradeMode: number = 0;

	get tradeMode(): number
	{
		return this._tradeMode;
	}

	set tradeMode(value: number)
	{
		this._tradeMode = value;
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

		// Send the connection message to enter the room
		this._connection.send(new OpenFlatConnectionMessageComposer(this._roomId, this._roomPassword));

		return true;
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

		// TODO: Send QuitMessageComposer
		// this._connection.send(new QuitMessageComposer());
	}

	/**
	 * Dispose the session and clean up resources
	 */
	dispose(): void
	{
		this._connection = null;
		this._state = RoomSessionState.ENDED;
	}

	sendChatMessage(message: string, _styleId: number = 0): void
	{
		if (this._connection === null) return;
		// TODO: Send ChatMessageComposer
	}

	sendShoutMessage(message: string, _styleId: number = 0): void
	{
		if (this._connection === null) return;
		// TODO: Send ShoutMessageComposer
	}

	sendWhisperMessage(recipientName: string, message: string, _styleId: number = 0): void
	{
		if (this._connection === null) return;
		// TODO: Send WhisperMessageComposer
	}

	sendChatTypingMessage(isTyping: boolean): void
	{
		if (this._connection === null) return;
		// TODO: Send StartTypingMessageComposer or CancelTypingMessageComposer
	}

	sendAvatarExpressionMessage(expressionId: number): void
	{
		if (this._connection === null) return;
		// TODO: Send AvatarExpressionMessageComposer
	}

	sendSignMessage(signId: number): void
	{
		if (this._connection === null) return;
		// TODO: Send SignMessageComposer
	}

	sendDanceMessage(danceId: number): void
	{
		if (this._connection === null) return;
		// TODO: Send DanceMessageComposer
	}

	sendChangePostureMessage(posture: number): void
	{
		if (this._connection === null) return;
		// TODO: Send ChangePostureMessageComposer
	}

	kickUser(userId: number): void
	{
		if (this._connection === null) return;
		// TODO: Send KickUserMessageComposer
	}

	banUserWithDuration(userId: number, duration: string): void
	{
		if (this._connection === null) return;
		// TODO: Send BanUserWithDurationMessageComposer
	}

	muteUser(userId: number, minutes: number): void
	{
		if (this._connection === null) return;
		// TODO: Send MuteUserMessageComposer
	}

	unmuteUser(userId: number): void
	{
		if (this._connection === null) return;
		// TODO: Send UnmuteUserMessageComposer
	}

	assignRights(userId: number): void
	{
		if (this._connection === null) return;
		// TODO: Send AssignRightsMessageComposer
	}

	removeRights(userId: number): void
	{
		if (this._connection === null) return;
		// TODO: Send RemoveRightsMessageComposer
	}

	letUserIn(userName: string, allow: boolean): void
	{
		if (this._connection === null) return;
		// TODO: Send LetUserInMessageComposer
	}
}
