import type {IActionContext} from '../core/types';
import type {ISessionState} from './types';

// Session module has no managers - it's purely reactive to server messages
type Managers = Record<string, never>;

export function createActions(ctx: IActionContext<ISessionState, Managers>)
{
	const {getState, updateState} = ctx;

	return {
		/**
		 * Reset session state (on disconnect)
		 */
		reset: () =>
		{
			updateState({
				userData: null,
				availability: null,
				clubLevel: 0,
				securityLevel: 0,
				achievementScore: 0,
				isAmbassador: false,
				isFirstLoginOfDay: false,
				activityPoints: new Map(),
				homeRoomId: 0,
				roomIdToEnter: 0,
				favouriteRooms: [],
			});
		},

		/**
		 * Check if user is logged in
		 */
		isLoggedIn: (): boolean =>
		{
			return getState().userData !== null;
		},

		/**
		 * Check if user has club membership
		 */
		hasClub: (): boolean =>
		{
			return getState().clubLevel > 0;
		},

		/**
		 * Check if user is VIP
		 */
		isVIP: (): boolean =>
		{
			return getState().clubLevel >= 2;
		},

		/**
		 * Check if user is moderator
		 */
		isModerator: (): boolean =>
		{
			return getState().securityLevel >= 3;
		},

		/**
		 * Get credits (activity point type 0)
		 */
		getCredits: (): number =>
		{
			return getState().activityPoints.get(0) ?? 0;
		},

		/**
		 * Get duckets (activity point type 5)
		 */
		getDuckets: (): number =>
		{
			return getState().activityPoints.get(5) ?? 0;
		},

		/**
		 * Get diamonds (activity point type 105)
		 */
		getDiamonds: (): number =>
		{
			return getState().activityPoints.get(105) ?? 0;
		},
	};
}

export type SessionActions = ReturnType<typeof createActions>;
