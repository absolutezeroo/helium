import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {AvatarEffect} from '../communication/messages/parser/inventory/AvatarEffectsMessageParser';
import type {IUserDataManager} from './IUserDataManager';
import type {IPerkManager} from './IPerkManager';
import type {IIgnoredUsersManager} from './IIgnoredUsersManager';
import type {IHabboGroupInfoManager} from './IHabboGroupInfoManager';

/**
 * Interface for session data manager
 * Manages user session data after authentication
 * Based on AS3 com.sulake.habbo.session.ISessionDataManager
 */
export interface ISessionDataManager
{
	readonly userDataManager: IUserDataManager;
	readonly perkManager: IPerkManager;
	readonly ignoredUsersManager: IIgnoredUsersManager;
	readonly groupInfoManager: IHabboGroupInfoManager;

	readonly systemOpen: boolean;
	readonly systemShutDown: boolean;
	readonly isAuthenticHabbo: boolean;

	readonly userId: number;
	readonly userName: string;
	readonly realName: string;
	readonly figure: string;
	readonly gender: string;
	readonly motto: string;

	readonly clubLevel: number;
	readonly securityLevel: number;
	readonly topSecurityLevel: number;
	readonly isAmbassador: boolean;
	readonly noobnessLevel: number;

	readonly hasVip: boolean;
	readonly hasClub: boolean;
	readonly isNoob: boolean;
	readonly isRealNoob: boolean;
	readonly isAnyRoomController: boolean;
	readonly nameChangeAllowed: boolean;
	readonly canChangeName: boolean;

	readonly respectTotal: number;
	readonly respectLeft: number;
	readonly petRespectLeft: number;
	readonly respectsReceived: number;
	readonly respectsRemaining: number;
	readonly respectsPetRemaining: number;

	readonly accountSafetyLocked: boolean;
	readonly safetyLocked: boolean;
	readonly isEmailVerified: boolean;

	readonly streamPublishingAllowed: boolean;
	readonly lastAccessDate: string;
	readonly isFirstLoginOfDay: boolean;

	readonly homeRoomId: number;
	readonly roomIdToEnter: number;
	readonly favouriteRooms: number[];
	readonly favouriteRoomsLimit: number;

	readonly activityPoints: Map<number, number>;
	readonly achievementScore: number;

	readonly uiFlags: number;
	readonly isRoomCameraFollowDisabled: boolean;
	readonly infoFeedEnabled: boolean;

	readonly figureSetIds: number[];
	readonly boundFurnitureNames: string[];
	readonly avatarEffects: AvatarEffect[];

	readonly mysteryBoxColor: string;
	readonly mysteryKeyColor: string;

	readonly buildersClubSecondsLeft: number;
	readonly buildersClubFurniLimit: number;
	readonly buildersClubMaxFurniLimit: number;
	readonly buildersClubSecondsLeftWithGrace: number | null;

	/**
	 * Check if user has at least the given security level
	 */
	hasSecurity(level: number): boolean;

	/**
	 * Send a message to the server
	 */
	send(composer: IMessageComposer<unknown[]>): void;

	/**
	 * Give respect to a user (decrements respectLeft)
	 */
	giveRespect(userId: number): void;

	/**
	 * Give respect to a pet (decrements petRespectLeft)
	 */
	givePetRespect(petId: number): void;

	/**
	 * Called when giving respect fails (restores counter)
	 */
	giveRespectFailed(): void;

	/**
	 * Set room camera follow disabled preference
	 */
	setRoomCameraFollowDisabled(disabled: boolean): void;

	/**
	 * Set friend bar state UI flag
	 */
	setFriendBarState(open: boolean): void;

	/**
	 * Set room tools state UI flag
	 */
	setRoomToolsState(open: boolean): void;

	/**
	 * Dispose of the session data manager
	 */
	dispose(): void;
}
