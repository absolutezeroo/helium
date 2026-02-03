import type {GuestRoomData, RoomEventData} from '@habbo/communication/messages/incoming/navigator';

/**
 * Room session state
 * Based on AS3: com.sulake.habbo.session.RoomSession states
 */
export type RoomSessionState = 'created' | 'started' | 'ended';

/**
 * User type constants
 * Based on AS3: com.sulake.habbo.session.UserDataManager
 */
export const RoomUserType = {
	USER: 1,
	PET: 2,
	BOT: 3,
	RENTABLE_BOT: 4,
} as const;

export type RoomUserTypeValue = typeof RoomUserType[keyof typeof RoomUserType];

/**
 * Room user data
 * Based on AS3: com.sulake.habbo.session.class_3490 (IRoomUserData)
 */
export interface RoomUserData
{
	/** Room index (unique per room session) */
	roomIndex: number;
	/** User/Pet/Bot ID */
	webId: number;
	/** User type (user, pet, bot, rentable bot) */
	type: RoomUserTypeValue;
	/** Display name */
	name: string;
	/** Figure string */
	figure: string;
	/** Gender (M/F) */
	sex: string;
	/** Custom info (motto, etc.) */
	custom: string;
	/** Achievement score */
	achievementScore: number;
	/** Group ID (if in a group) */
	groupId: number;
	/** Group badge code */
	groupBadgeCode: string;
	/** Group name */
	groupName: string;
	/** Is swimming */
	isSwimming: boolean;
	/** Pet level (for pets) */
	petLevel: number;
	/** Has saddle (for pets) */
	hasSaddle: boolean;
	/** Is riding (for pets) */
	isRiding: boolean;
	/** Can breed (for pets) */
	canBreed: boolean;
	/** Can harvest (for pets) */
	canHarvest: boolean;
	/** Can revive (for pets) */
	canRevive: boolean;
	/** Has breeding permission (for pets) */
	hasBreedingPermission: boolean;
	/** Bot skill count (for bots) */
	botSkillCount: number;
}

/**
 * Room module state
 */
export interface RoomState
{
	// === Room Info ===
	/** Current room data */
	currentRoom: GuestRoomData | null;

	/** Room rating score */
	rating: number;

	/** Whether user can rate this room */
	canRate: boolean;

	/** Whether room is staff picked */
	isStaffPick: boolean;

	/** Current room event (if any) */
	roomEvent: RoomEventData | null;

	// === Session State ===
	/** Room session state */
	sessionState: RoomSessionState;

	/** Own user's room index (unique per room session) */
	ownUserRoomIndex: number;

	/** Is user the room owner */
	isRoomOwner: boolean;

	/** Room controller level (0-5) */
	roomControllerLevel: number;

	/** Is user a spectator */
	isSpectator: boolean;

	/** Is guild room */
	isGuildRoom: boolean;

	/** Are pets allowed */
	arePetsAllowed: boolean;

	// === Users ===
	/** All users in room (by room index) */
	users: Record<number, RoomUserData>;

	/** User badges cache (userId -> badges) */
	userBadges: Record<number, string[]>;
}

/**
 * Create initial room state
 */
export function createInitialRoomState(): RoomState
{
	return {
		currentRoom: null,
		rating: 0,
		canRate: false,
		isStaffPick: false,
		roomEvent: null,
		sessionState: 'ended',
		ownUserRoomIndex: -1,
		isRoomOwner: false,
		roomControllerLevel: 0,
		isSpectator: false,
		isGuildRoom: false,
		arePetsAllowed: false,
		users: {},
		userBadges: {},
	};
}
