/**
 * User profile data
 */
export interface IUserData
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
export interface IAvailabilityStatus
{
	isOpen: boolean;
	onShutDown: boolean;
	isAuthenticHabbo: boolean;
}

/**
 * Session module state
 */
export interface ISessionState
{
	/** Current user data */
	userData: IUserData | null;

	/** Server availability */
	availability: IAvailabilityStatus | null;

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
