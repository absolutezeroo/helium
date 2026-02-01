import {createRoot, createSignal} from 'solid-js';

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

function createSessionStore()
{
	const [userData, setUserData] = createSignal<UserData | null>(null);
	const [availability, setAvailability] = createSignal<AvailabilityStatus | null>(null);
	const [clubLevel, setClubLevel] = createSignal<number>(0);
	const [securityLevel, setSecurityLevel] = createSignal<number>(0);
	const [achievementScore, setAchievementScore] = createSignal<number>(0);
	const [isAmbassador, setIsAmbassador] = createSignal<boolean>(false);
	const [isFirstLoginOfDay, setIsFirstLoginOfDay] = createSignal<boolean>(false);
	const [activityPoints, setActivityPoints] = createSignal<Map<number, number>>(new Map());

	// Navigator settings
	const [homeRoomId, setHomeRoomId] = createSignal<number>(0);
	const [roomIdToEnter, setRoomIdToEnter] = createSignal<number>(0);
	const [favouriteRooms, setFavouriteRooms] = createSignal<number[]>([]);

	return {
		// User data
		userData,
		setUserData,

		// Availability
		availability,
		setAvailability,

		// Club & Rights
		clubLevel,
		setClubLevel,
		securityLevel,
		setSecurityLevel,
		isAmbassador,
		setIsAmbassador,

		// Stats
		achievementScore,
		setAchievementScore,
		activityPoints,
		setActivityPoints,

		// Login
		isFirstLoginOfDay,
		setIsFirstLoginOfDay,

		// Navigator
		homeRoomId,
		setHomeRoomId,
		roomIdToEnter,
		setRoomIdToEnter,
		favouriteRooms,
		setFavouriteRooms,

		// Computed
		isLoggedIn: () => userData() !== null,
		hasClub: () => clubLevel() > 0,
		isVIP: () => clubLevel() >= 2,
		isModerator: () => securityLevel() >= 3,

		// Reset
		reset: () =>
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
		},
	};
}

// Create singleton store
export const sessionStore = createRoot(createSessionStore);
