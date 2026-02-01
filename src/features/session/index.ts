import {createRoot, createSignal} from 'solid-js';
import {registerMessageEvent} from '@/ui/hooks';

// Message Events
import {UserObjectMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserObjectMessageEvent';
import {UserRightsMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserRightsMessageEvent';
import {FigureUpdateMessageEvent} from '@habbo/communication/messages/incoming/avatar/FigureUpdateMessageEvent';
import {NavigatorSettingsMessageEvent} from '@habbo/communication/messages/incoming/navigator/NavigatorSettingsMessageEvent';
import {FavouritesMessageEvent} from '@habbo/communication/messages/incoming/navigator/FavouritesMessageEvent';
import {ActivityPointsMessageEvent} from '@habbo/communication/messages/incoming/notifications/ActivityPointsMessageEvent';
import {AchievementsScoreMessageEvent} from '@habbo/communication/messages/incoming/inventory/AchievementsScoreMessageEvent';
import {AvailabilityStatusMessageEvent} from '@habbo/communication/messages/incoming/availability/AvailabilityStatusMessageEvent';

// Parsers
import type {UserObjectMessageParser} from '@habbo/communication/messages/parser/handshake/UserObjectMessageParser';
import type {UserRightsMessageParser} from '@habbo/communication/messages/parser/handshake/UserRightsMessageParser';
import type {FigureUpdateMessageParser} from '@habbo/communication/messages/parser/avatar/FigureUpdateMessageParser';
import type {NavigatorSettingsMessageParser} from '@habbo/communication/messages/parser/navigator/NavigatorSettingsMessageParser';
import type {FavouritesMessageParser} from '@habbo/communication/messages/parser/navigator/FavouritesMessageParser';
import type {ActivityPointsMessageParser} from '@habbo/communication/messages/parser/notifications/ActivityPointsMessageParser';
import type {AchievementsScoreMessageParser} from '@habbo/communication/messages/parser/inventory/AchievementsScoreMessageParser';
import type {AvailabilityStatusMessageParser} from '@habbo/communication/messages/parser/availability/AvailabilityStatusMessageParser';

// ============================================================================
// Types
// ============================================================================

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

export interface AvailabilityStatus
{
	isOpen: boolean;
	onShutDown: boolean;
	isAuthenticHabbo: boolean;
}

// ============================================================================
// Feature
// ============================================================================

function createSessionFeature()
{
	// State
	const [userData, setUserData] = createSignal<UserData | null>(null);
	const [availability, setAvailability] = createSignal<AvailabilityStatus | null>(null);
	const [clubLevel, setClubLevel] = createSignal(0);
	const [securityLevel, setSecurityLevel] = createSignal(0);
	const [achievementScore, setAchievementScore] = createSignal(0);
	const [isAmbassador, setIsAmbassador] = createSignal(false);
	const [isFirstLoginOfDay, setIsFirstLoginOfDay] = createSignal(false);
	const [activityPoints, setActivityPoints] = createSignal<Map<number, number>>(new Map());
	const [homeRoomId, setHomeRoomId] = createSignal(0);
	const [roomIdToEnter, setRoomIdToEnter] = createSignal(0);
	const [favouriteRooms, setFavouriteRooms] = createSignal<number[]>([]);

	// Cleanup
	const cleanups: (() => void)[] = [];

	// Lifecycle
	function init()
	{
		// User data
		cleanups.push(
			registerMessageEvent(UserObjectMessageEvent, (_, parser) =>
			{
				const p = parser as UserObjectMessageParser;

				setUserData({
					id: p.id,
					name: p.name,
					figure: p.figure,
					gender: p.sex,
					motto: p.customData,
					realName: p.realName,
					respectsReceived: p.respectTotal,
					respectsRemaining: p.respectLeft,
					respectsPetRemaining: p.petRespectLeft,
					streamPublishingAllowed: p.streamPublishingAllowed,
					lastAccessDate: p.lastAccessDate,
					canChangeName: p.nameChangeAllowed,
					safetyLocked: p.accountSafetyLocked,
				});
			})
		);

		// Figure updates
		cleanups.push(
			registerMessageEvent(FigureUpdateMessageEvent, (_, parser) =>
			{
				const p = parser as FigureUpdateMessageParser;
				const current = userData();

				if (current)
				{
					setUserData({
						...current,
						figure: p.figure,
						gender: p.gender,
					});
				}
			})
		);

		// Availability status
		cleanups.push(
			registerMessageEvent(AvailabilityStatusMessageEvent, (_, parser) =>
			{
				const p = parser as AvailabilityStatusMessageParser;

				setAvailability({
					isOpen: p.isOpen,
					onShutDown: p.onShutDown,
					isAuthenticHabbo: p.isAuthenticHabbo,
				});
			})
		);

		// User rights
		cleanups.push(
			registerMessageEvent(UserRightsMessageEvent, (_, parser) =>
			{
				const p = parser as UserRightsMessageParser;

				setClubLevel(p.clubLevel);
				setSecurityLevel(p.securityLevel);
				setIsAmbassador(p.isAmbassador);
			})
		);

		// Navigator settings
		cleanups.push(
			registerMessageEvent(NavigatorSettingsMessageEvent, (_, parser) =>
			{
				const p = parser as NavigatorSettingsMessageParser;

				setHomeRoomId(p.homeRoomId);
				setRoomIdToEnter(p.roomIdToEnter);
			})
		);

		// Favourites
		cleanups.push(
			registerMessageEvent(FavouritesMessageEvent, (_, parser) =>
			{
				const p = parser as FavouritesMessageParser;

				setFavouriteRooms([...p.favouriteRoomIds]);
			})
		);

		// Activity points
		cleanups.push(
			registerMessageEvent(ActivityPointsMessageEvent, (_, parser) =>
			{
				const p = parser as ActivityPointsMessageParser;

				setActivityPoints(new Map(p.points));
			})
		);

		// Achievement score
		cleanups.push(
			registerMessageEvent(AchievementsScoreMessageEvent, (_, parser) =>
			{
				const p = parser as AchievementsScoreMessageParser;

				setAchievementScore(p.score);
			})
		);
	}

	function dispose()
	{
		cleanups.forEach(fn => fn());
		cleanups.length = 0;
	}

	function reset()
	{
		setUserData(null);
		setAvailability(null);
		setClubLevel(0);
		setSecurityLevel(0);
		setAchievementScore(0);
		setIsAmbassador(false);
		setIsFirstLoginOfDay(false);
		setActivityPoints(new Map());
		setHomeRoomId(0);
		setRoomIdToEnter(0);
		setFavouriteRooms([]);
	}

	return {
		// State (reactive)
		userData,
		availability,
		clubLevel,
		securityLevel,
		achievementScore,
		isAmbassador,
		isFirstLoginOfDay,
		activityPoints,
		homeRoomId,
		roomIdToEnter,
		favouriteRooms,

		// Computed
		isLoggedIn: () => userData() !== null,
		hasClub: () => clubLevel() > 0,
		isVIP: () => clubLevel() >= 2,
		isModerator: () => securityLevel() >= 3,

		// Lifecycle
		init,
		dispose,
		reset,
	};
}

// Singleton instance
export const session = createRoot(createSessionFeature);
export type Session = typeof session;
