import type {MessageHandlers} from '../core/types';
import type {AvailabilityStatus, SessionState, UserData} from './types';

// Parser types
import type {UserObjectMessageParser} from '@habbo/communication/messages/parser/handshake/UserObjectMessageParser';
import type {UserRightsMessageParser} from '@habbo/communication/messages/parser/handshake/UserRightsMessageParser';
import type {FigureUpdateMessageParser} from '@habbo/communication/messages/parser/avatar/FigureUpdateMessageParser';
import type {
	NavigatorSettingsMessageParser
} from '@habbo/communication/messages/parser/navigator/NavigatorSettingsMessageParser';
import type {FavouritesMessageParser} from '@habbo/communication/messages/parser/navigator/FavouritesMessageParser';
import type {
	ActivityPointsMessageParser
} from '@habbo/communication/messages/parser/notifications/ActivityPointsMessageParser';
import type {
	AchievementsScoreMessageParser
} from '@habbo/communication/messages/parser/inventory/AchievementsScoreMessageParser';
import type {
	AvailabilityStatusMessageParser
} from '@habbo/communication/messages/parser/availability/AvailabilityStatusMessageParser';

export const handlers: MessageHandlers<SessionState> = {

	/**
	 * User profile data received after login
	 */
	UserObjectMessageEvent: (parser: UserObjectMessageParser): Partial<SessionState> =>
	{
		const userData: UserData = {
			id: parser.id,
			name: parser.name,
			figure: parser.figure,
			gender: parser.sex,
			motto: parser.customData,
			realName: parser.realName,
			respectsReceived: parser.respectTotal,
			respectsRemaining: parser.respectLeft,
			respectsPetRemaining: parser.petRespectLeft,
			streamPublishingAllowed: parser.streamPublishingAllowed,
			lastAccessDate: parser.lastAccessDate,
			canChangeName: parser.nameChangeAllowed,
			safetyLocked: parser.accountSafetyLocked,
		};

		return {userData};
	},

	/**
	 * Figure/look updated
	 */
	FigureUpdateMessageEvent: (parser: FigureUpdateMessageParser, state): Partial<SessionState> =>
	{
		if (!state.userData) return {};

		return {
			userData: {
				...state.userData,
				figure: parser.figure,
				gender: parser.gender,
			},
		};
	},

	/**
	 * Server availability status
	 */
	AvailabilityStatusMessageEvent: (parser: AvailabilityStatusMessageParser): Partial<SessionState> =>
	{
		const availability: AvailabilityStatus = {
			isOpen: parser.isOpen,
			onShutDown: parser.onShutDown,
			isAuthenticHabbo: parser.isAuthenticHabbo,
		};

		return {availability};
	},

	/**
	 * User rights (club, security level, ambassador)
	 */
	UserRightsMessageEvent: (parser: UserRightsMessageParser): Partial<SessionState> => ({
		clubLevel: parser.clubLevel,
		securityLevel: parser.securityLevel,
		isAmbassador: parser.isAmbassador,
	}),

	/**
	 * Navigator settings (home room)
	 */
	NavigatorSettingsMessageEvent: (parser: NavigatorSettingsMessageParser): Partial<SessionState> => ({
		homeRoomId: parser.homeRoomId,
		roomIdToEnter: parser.roomIdToEnter,
	}),

	/**
	 * Favourite rooms list
	 */
	FavouritesMessageEvent: (parser: FavouritesMessageParser): Partial<SessionState> => ({
		favouriteRooms: [...parser.favouriteRoomIds],
	}),

	/**
	 * Activity points (currencies)
	 */
	ActivityPointsMessageEvent: (parser: ActivityPointsMessageParser): Partial<SessionState> => ({
		activityPoints: new Map(parser.points),
	}),

	/**
	 * Achievement score
	 */
	AchievementsScoreMessageEvent: (parser: AchievementsScoreMessageParser): Partial<SessionState> => ({
		achievementScore: parser.score,
	}),
};
