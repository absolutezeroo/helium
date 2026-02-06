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
import type {MessageHandlers} from '../core/types';
import type {IAvailabilityStatus, ISessionState, IUserData} from './types';

export const handlers: MessageHandlers<ISessionState> = {

	/**
	 * User profile data received after login
	 */
	UserObjectMessageEvent: (parser: UserObjectMessageParser): Partial<ISessionState> =>
	{
		const userData: IUserData = {
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
	FigureUpdateMessageEvent: (parser: FigureUpdateMessageParser, state): Partial<ISessionState> =>
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
	AvailabilityStatusMessageEvent: (parser: AvailabilityStatusMessageParser): Partial<ISessionState> =>
	{
		const availability: IAvailabilityStatus = {
			isOpen: parser.isOpen,
			onShutDown: parser.onShutDown,
			isAuthenticHabbo: parser.isAuthenticHabbo,
		};

		return {availability};
	},

	/**
	 * User rights (club, security level, ambassador)
	 */
	UserRightsMessageEvent: (parser: UserRightsMessageParser): Partial<ISessionState> => ({
		clubLevel: parser.clubLevel,
		securityLevel: parser.securityLevel,
		isAmbassador: parser.isAmbassador,
	}),

	/**
	 * Navigator settings (home room)
	 */
	NavigatorSettingsMessageEvent: (parser: NavigatorSettingsMessageParser): Partial<ISessionState> => ({
		homeRoomId: parser.homeRoomId,
		roomIdToEnter: parser.roomIdToEnter,
	}),

	/**
	 * Favourite rooms list
	 */
	FavouritesMessageEvent: (parser: FavouritesMessageParser): Partial<ISessionState> => ({
		favouriteRooms: [...parser.favouriteRoomIds],
	}),

	/**
	 * Activity points (currencies)
	 */
	ActivityPointsMessageEvent: (parser: ActivityPointsMessageParser): Partial<ISessionState> => ({
		activityPoints: new Map(parser.points),
	}),

	/**
	 * Achievement score
	 */
	AchievementsScoreMessageEvent: (parser: AchievementsScoreMessageParser): Partial<ISessionState> => ({
		achievementScore: parser.score,
	}),
};
