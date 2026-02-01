/**
 * Interface for session data manager
 * Manages user session data after authentication
 */
export interface ISessionDataManager
{
	// System status
	readonly systemOpen: boolean;
	readonly systemShutDown: boolean;
	readonly isAuthenticHabbo: boolean;

	// User identification
	readonly userId: number;
	readonly userName: string;
	readonly realName: string;
	readonly figure: string;
	readonly gender: string;
	readonly motto: string;

	// User status
	readonly clubLevel: number;
	readonly securityLevel: number;
	readonly isAmbassador: boolean;
	readonly noobnessLevel: number;

	// Permissions
	readonly hasVip: boolean;
	readonly hasClub: boolean;
	readonly isNoob: boolean;
	readonly isRealNoob: boolean;
	readonly nameChangeAllowed: boolean;
	readonly canChangeName: boolean;

	// Respect
	readonly respectTotal: number;
	readonly respectLeft: number;
	readonly petRespectLeft: number;
	readonly respectsReceived: number;
	readonly respectsRemaining: number;
	readonly respectsPetRemaining: number;

	// Safety
	readonly accountSafetyLocked: boolean;
	readonly safetyLocked: boolean;

	// Stream
	readonly streamPublishingAllowed: boolean;
	readonly lastAccessDate: string;

	// Navigator settings
	readonly homeRoomId: number;
	readonly roomIdToEnter: number;
	readonly favouriteRooms: number[];
	readonly favouriteRoomsLimit: number;

	// Currency
	readonly activityPoints: Map<number, number>;
	readonly achievementScore: number;

	// Methods
	hasSecurity(level: number): boolean;

	dispose(): void;
}
