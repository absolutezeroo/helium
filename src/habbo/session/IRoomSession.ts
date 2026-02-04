import type {IConnection} from '@core/communication/connection/IConnection';
import type {RoomModerationSettings} from '../communication/messages/incoming/navigator';

/**
 * Room session state constants
 */
export const RoomSessionState = {
	CREATED: 'RSE_CREATED',
	STARTED: 'RSE_STARTED',
	ENDED: 'RSE_ENDED',
} as const;

export type RoomSessionStateType = typeof RoomSessionState[keyof typeof RoomSessionState];

/**
 * Room session interface
 *
 * Based on AS3: com.sulake.habbo.session.IRoomSession
 *
 * Represents an active session in a room. Handles communication
 * with the server for room-specific actions.
 */
export interface IRoomSession
{
	// Core properties
	readonly roomId: number;
	readonly state: RoomSessionStateType;

	// Connection
	connection: IConnection | null;
	roomPassword: string;
	roomResources: string;

	// Session state
	ownUserRoomId: number;
	isRoomOwner: boolean;
	roomControllerLevel: number;
	isGuildRoom: boolean;
	tradeMode: number;
	doorMode: number;
	isSpectatorMode: boolean;
	arePetsAllowed: boolean;
	roomModerationSettings: RoomModerationSettings | null;
	isUserDecorating: boolean;
	isGameSession: boolean;

	/**
	 * Start the room session
	 * Sends OpenFlatConnectionMessageComposer to enter the room
	 */
	start(): boolean;

	/**
	 * Quit the room session
	 */
	quit(): void;

	/**
	 * Dispose the session
	 */
	dispose(): void;

	// Chat methods
	sendChatMessage(message: string, styleId?: number): void;
	sendShoutMessage(message: string, styleId?: number): void;
	sendWhisperMessage(recipientName: string, message: string, styleId?: number): void;
	sendChatTypingMessage(isTyping: boolean): void;

	// Avatar methods
	sendAvatarExpressionMessage(expressionId: number): void;
	sendSignMessage(signId: number): void;
	sendDanceMessage(danceId: number): void;
	sendChangePostureMessage(posture: number): void;

	// Moderation methods
	kickUser(userId: number): void;
	banUserWithDuration(userId: number, duration: string): void;
	muteUser(userId: number, minutes: number): void;
	unmuteUser(userId: number): void;

	// Rights methods
	assignRights(userId: number): void;
	removeRights(userId: number): void;
	letUserIn(userName: string, allow: boolean): void;
}
