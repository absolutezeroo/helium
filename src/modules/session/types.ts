/**
 * User profile data
 */
export interface UserData
{
	id: number;
	name: string;
	figure: string;
	gender: string;
	motto: string;
	realName: string;
	respectsReceived: number;
	respectsRemaining: number;
	respectsPetRemaining: number;
	streamPublishingAllowed: boolean;
	lastAccessDate: string;
	canChangeName: boolean;
	safetyLocked: boolean;
}

/**
 * Server availability status
 */
export interface AvailabilityStatus
{
	isOpen: boolean;
	onShutDown: boolean;
	isAuthenticHabbo: boolean;
}

/**
 * Session module state
 */
export interface SessionState
{
	/** Current user data */
	userData: UserData | null;

	/** Server availability */
	availability: AvailabilityStatus | null;

	/** Club membership level (0 = none, 1 = HC, 2 = VIP) */
	clubLevel: number;

	/** Security/staff level */
	securityLevel: number;

	/** Total achievement score */
	achievementScore: number;

	/** Whether user is an ambassador */
	isAmbassador: boolean;

	/** Whether this is first login of the day */
	isFirstLoginOfDay: boolean;

	/** Activity points by type (0 = credits, 5 = duckets, etc.) */
	activityPoints: Map<number, number>;

	/** User's home room ID */
	homeRoomId: number;

	/** Room ID to enter on login */
	roomIdToEnter: number;

	/** Favourite room IDs */
	favouriteRooms: number[];
}
