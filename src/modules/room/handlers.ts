import type {MessageHandlers} from '../core/types';
import type {RoomState, RoomUserData as ModuleRoomUserData} from './types';
import {createInitialRoomState} from './types';

// Parser types
import type {
	GetGuestRoomResultMessageParser
} from '@habbo/communication/messages/parser/navigator/GetGuestRoomResultMessageParser';
import type {RoomRatingMessageParser} from '@habbo/communication/messages/parser/navigator/RoomRatingMessageParser';
import type {RoomEventMessageParser} from '@habbo/communication/messages/parser/navigator/RoomEventMessageParser';
import type {RoomReadyMessageParser} from '@habbo/communication/messages/parser/room/session/RoomReadyMessageParser';
import type {
	YouAreControllerMessageParser
} from '@habbo/communication/messages/parser/room/permissions/YouAreControllerMessageParser';
import type {UsersMessageParser} from '@habbo/communication/messages/parser/room/engine/UsersMessageParser';
import type {UserRemoveMessageParser} from '@habbo/communication/messages/parser/room/engine/UserRemoveMessageParser';
import type {
	RoomEntryInfoMessageParser
} from '@habbo/communication/messages/parser/room/engine/RoomEntryInfoMessageParser';

// Data types
import type {RoomUserData as ParserRoomUserData} from '@habbo/communication/messages/incoming/room/engine/RoomUserData';

/**
 * Convert parser RoomUserData to module RoomUserData
 */
function convertUserData(data: ParserRoomUserData): ModuleRoomUserData
{
	return {
		roomIndex: data.roomIndex,
		webId: data.webID,
		type: data.userType as ModuleRoomUserData['type'],
		name: data.name,
		figure: data.figure,
		sex: data.sex,
		custom: data.custom,
		achievementScore: data.achievementScore,
		groupId: parseInt(data.groupID) || 0,
		groupBadgeCode: '', // Not in parser data
		groupName: data.groupName,
		isSwimming: false, // Determined by figure
		petLevel: data.petLevel,
		hasSaddle: data.hasSaddle,
		isRiding: data.isRiding,
		canBreed: data.canBreed,
		canHarvest: data.canHarvest,
		canRevive: data.canRevive,
		hasBreedingPermission: data.hasBreedingPermission,
		botSkillCount: data.botSkills?.length || 0,
	};
}

export const handlers: MessageHandlers<RoomState> = {

	/**
	 * Room info / entry
	 */
	GetGuestRoomResultMessageEvent: (parser: GetGuestRoomResultMessageParser): Partial<RoomState> =>
	{
		if (parser.enterRoom && parser.data)
		{
			return {
				currentRoom: parser.data,
				isStaffPick: parser.staffPick,
				sessionState: 'created',
			};
		}

		return {};
	},

	/**
	 * Room rating updated
	 */
	RoomRatingMessageEvent: (parser: RoomRatingMessageParser): Partial<RoomState> => ({
		rating: parser.rating,
		canRate: parser.canRate,
	}),

	/**
	 * Room event started/updated
	 */
	RoomEventMessageEvent: (parser: RoomEventMessageParser): Partial<RoomState> => ({
		roomEvent: parser.data,
	}),

	/**
	 * Room event cancelled
	 */
	RoomEventCancelMessageEvent: (): Partial<RoomState> => ({
		roomEvent: null,
	}),

	/**
	 * Room ready - session started
	 */
	RoomReadyMessageEvent: (parser: RoomReadyMessageParser): Partial<RoomState> => ({
		sessionState: 'started',
	}),

	/**
	 * Room entry info - ownership status
	 */
	RoomEntryInfoMessageEvent: (parser: RoomEntryInfoMessageParser): Partial<RoomState> => ({
		isRoomOwner: parser.owner,
	}),

	/**
	 * Close connection - session ended
	 */
	CloseConnectionMessageEvent: (): Partial<RoomState> =>
	{
		// Return initial state to clear everything
		return createInitialRoomState();
	},

	/**
	 * Flat accessible - doorbell answered, can enter
	 */
	FlatAccessibleMessageEvent: (): Partial<RoomState> => ({}),

	/**
	 * You are controller (have rights)
	 */
	YouAreControllerMessageEvent: (parser: YouAreControllerMessageParser): Partial<RoomState> => ({
		roomControllerLevel: parser.roomControllerLevel,
	}),

	/**
	 * You are room owner
	 */
	YouAreOwnerMessageEvent: (): Partial<RoomState> => ({
		isRoomOwner: true,
	}),

	/**
	 * Users entered room
	 */
	UsersMessageEvent: (
		parser: UsersMessageParser,
		state: Readonly<RoomState>
	): Partial<RoomState> =>
	{
		const newUsers: Record<number, ModuleRoomUserData> = {...state.users};

		for (let i = 0; i < parser.userCount; i++)
		{
			const data = parser.getUser(i);

			if (data !== null)
			{
				const userData = convertUserData(data);
				newUsers[userData.roomIndex] = userData;
			}
		}

		return {users: newUsers};
	},

	/**
	 * User left room
	 */
	UserRemoveMessageEvent: (
		parser: UserRemoveMessageParser,
		state: Readonly<RoomState>
	): Partial<RoomState> =>
	{
		const newUsers: Record<number, ModuleRoomUserData> = {...state.users};

		delete newUsers[parser.roomIndex];

		return {users: newUsers};
	},
};
