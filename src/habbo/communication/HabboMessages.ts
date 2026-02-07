import type {
	ComposerClass,
	EventClass,
	IMessageConfiguration
} from '@core/communication/messages/IMessageConfiguration';

// Incoming Events - Handshake
import {
	AuthenticationOKMessageEvent,
	CompleteDiffieHandshakeMessageEvent,
	DisconnectReasonMessageEvent,
	GenericErrorMessageEvent,
	InitDiffieHandshakeMessageEvent,
	IsFirstLoginOfDayMessageEvent,
	NoobnessLevelMessageEvent,
	PingMessageEvent,
	UniqueMachineIdMessageEvent,
	UserObjectMessageEvent,
	UserRightsMessageEvent,
	IdentityAccountsEvent,
} from './messages/incoming/handshake';

// Incoming Events - Availability
import {
	AvailabilityStatusMessageEvent,
	LoginFailedHotelClosedMessageEvent,
	MaintenanceStatusMessageEvent,
} from './messages/incoming/availability';

// Incoming Events - Avatar
import {FigureUpdateMessageEvent,} from './messages/incoming/avatar';

// Incoming Events - Navigator
import {
	CanCreateRoomEventMessageEvent,
	CanCreateRoomMessageEvent,
	CategoriesWithVisitorCountMessageEvent,
	CompetitionRoomsDataMessageEvent,
	ConvertedRoomIdMessageEvent,
	DoorbellMessageEvent,
	FavouriteChangedMessageEvent,
	FavouritesMessageEvent,
	FlatAccessDeniedMessageEvent,
	FlatCreatedMessageEvent,
	GetGuestRoomResultMessageEvent,
	GuestRoomSearchResultMessageEvent,
	NavigatorSettingsMessageEvent,
	OfficialRoomsMessageEvent,
	PopularRoomTagsResultMessageEvent,
	RoomEventCancelMessageEvent,
	RoomEventMessageEvent,
	RoomInfoUpdatedMessageEvent,
	RoomRatingMessageEvent,
	UserEventCatsMessageEvent,
	UserFlatCatsMessageEvent,
} from './messages/incoming/navigator';

// Incoming Events - Notifications
import {ActivityPointsMessageEvent, InfoFeedEnableMessageEvent,} from './messages/incoming/notifications';

// Incoming Events - Inventory
import {
	AchievementsScoreMessageEvent,
	AvatarEffectsMessageEvent,
	BadgesMessageEvent,
	BotInventoryMessageEvent,
	FigureSetIdsMessageEvent,
	FurniListAddOrUpdateMessageEvent,
	FurniListInvalidateMessageEvent,
	FurniListMessageEvent,
	FurniListRemoveMessageEvent,
	PetInventoryMessageEvent,
	TradingAcceptMessageEvent,
	TradingCloseMessageEvent,
	TradingCompletedMessageEvent,
	TradingConfirmationMessageEvent,
	TradingItemListMessageEvent,
	TradingNotOpenMessageEvent,
	TradingOpenMessageEvent,
	UnseenItemsMessageEvent,
} from './messages/incoming/inventory';

// Incoming Events - Mystery Box
import {MysteryBoxKeysMessageEvent,} from './messages/incoming/mysterybox';

// Incoming Events - Catalog
import {BuildersClubSubscriptionStatusMessageEvent,} from './messages/incoming/catalog';

// Incoming Events - Room Session
import {
	CloseConnectionMessageEvent,
	FlatAccessibleMessageEvent,
	OpenConnectionMessageEvent,
	RoomReadyMessageEvent,
} from './messages/incoming/room/session';

// Incoming Events - Room Layout
import {RoomEntryTileMessageEvent,} from './messages/incoming/room/layout';

// Incoming Events - Room Permissions
import {YouAreControllerMessageEvent, YouAreOwnerMessageEvent,} from './messages/incoming/room/permissions';

// Incoming Events - Room Engine
import {
	FloorHeightMapMessageEvent,
	FurnitureAliasesMessageEvent,
	HeightMapMessageEvent,
	HeightMapUpdateMessageEvent,
	ItemAddMessageEvent,
	ItemRemoveMessageEvent,
	ItemsMessageEvent,
	ItemUpdateMessageEvent,
	ObjectAddMessageEvent,
	ObjectDataUpdateMessageEvent,
	ObjectRemoveMessageEvent,
	ObjectsMessageEvent,
	ObjectUpdateMessageEvent,
	RoomEntryInfoMessageEvent,
	SlideObjectBundleMessageEvent,
	UserRemoveMessageEvent,
	UsersMessageEvent,
	UserUpdateMessageEvent,
} from './messages/incoming/room/engine';

// Incoming Events - Room Chat
import {
	ChatMessageEvent,
	ShoutMessageEvent,
	UserTypingMessageEvent,
	WhisperMessageEvent,
} from './messages/incoming/room/chat';

// Incoming Events - Room Furniture
import {
	OpenPetPackageRequestedMessageEvent,
	OpenPetPackageResultMessageEvent,
	PresentOpenedMessageEvent,
	RoomDimmerPresetsMessageEvent,
} from './messages/incoming/room/furniture';

// Incoming Events - Poll
import {
	PollContentsEvent,
	PollErrorEvent,
	PollOfferEvent,
	QuestionAnsweredEvent,
	QuestionEvent,
	QuestionFinishedEvent,
} from './messages/incoming/poll';

// Incoming Events - Error
import {ErrorReportEvent} from './messages/incoming/error';

// Incoming Events - Room Action
import {
	AvatarEffectMessageEvent,
	CarryObjectMessageEvent,
	DanceMessageEvent,
	ExpressionMessageEvent,
	SleepMessageEvent,
	UseObjectMessageEvent,
	UserChangeMessageEvent,
} from './messages/incoming/room/action';

// Incoming Events - New Navigator
import {
	NavigatorCollapsedCategoriesMessageEvent,
	NavigatorLiftedRoomsMessageEvent,
	NavigatorMetaDataMessageEvent,
	NavigatorSavedSearchesMessageEvent,
	NavigatorSearchResultSetMessageEvent,
	NavigatorWindowSettingsMessageEvent,
} from './messages/incoming/newnavigator';

// Outgoing Composers - Handshake & Core
import {
	ClientHelloMessageComposer,
	CompleteDiffieHandshakeMessageComposer,
	DisconnectMessageComposer,
	EventLogMessageComposer,
	InfoRetrieveMessageComposer,
	InitDiffieHandshakeMessageComposer,
	PongMessageComposer,
	SSOTicketMessageComposer,
	UniqueIDMessageComposer,
	VersionCheckMessageComposer,
} from './messages/outgoing';

// Outgoing Composers - Navigator
import {
	AddFavouriteRoomMessageComposer,
	CancelEventMessageComposer,
	CanCreateRoomMessageComposer,
	CompetitionRoomsSearchMessageComposer,
	ConvertGlobalRoomIdMessageComposer,
	CreateFlatMessageComposer,
	DeleteFavouriteRoomMessageComposer,
	EditEventMessageComposer,
	ForwardToSomeRoomMessageComposer,
	GetGuestRoomMessageComposer,
	GetOfficialRoomsMessageComposer,
	GetPopularRoomTagsMessageComposer,
	GetUserEventCatsMessageComposer,
	GetUserFlatCatsMessageComposer,
	GuildBaseSearchMessageComposer,
	MyFavouriteRoomsSearchMessageComposer,
	MyFrequentRoomHistorySearchMessageComposer,
	MyFriendsRoomsSearchMessageComposer,
	MyGuildBasesSearchMessageComposer,
	MyRecommendedRoomsMessageComposer,
	MyRoomHistorySearchMessageComposer,
	MyRoomRightsSearchMessageComposer,
	MyRoomsSearchMessageComposer,
	PopularRoomsSearchMessageComposer,
	RateFlatMessageComposer,
	RemoveOwnRoomRightsRoomMessageComposer,
	RoomAdEventTabAdClickedComposer,
	RoomAdEventTabViewedComposer,
	RoomAdSearchMessageComposer,
	RoomsWhereMyFriendsAreSearchMessageComposer,
	RoomsWithHighestScoreSearchMessageComposer,
	RoomTextSearchMessageComposer,
	SetRoomSessionTagsMessageComposer,
	ToggleStaffPickMessageComposer,
	UpdateHomeRoomMessageComposer,
} from './messages/outgoing/navigator';

// Outgoing Composers - New Navigator
import {
	NavigatorAddCollapsedCategoryMessageComposer,
	NavigatorAddSavedSearchComposer,
	NavigatorDeleteSavedSearchComposer,
	NavigatorRemoveCollapsedCategoryMessageComposer,
	NavigatorSetSearchCodeViewModeMessageComposer,
	NewNavigatorInitComposer,
	NewNavigatorSearchComposer,
} from './messages/outgoing/newnavigator';

// Outgoing Composers - Room Session
import {ChangeQueueMessageComposer, OpenFlatConnectionMessageComposer,} from './messages/outgoing/room/session';

// Outgoing Composers - Room Engine
import {GetFurnitureAliasesMessageComposer, GetHeightMapMessageComposer,} from './messages/outgoing/room/engine';

// Outgoing Composers - Room Chat
import {ChatMessageComposer, ShoutMessageComposer, WhisperMessageComposer,} from './messages/outgoing/room/chat';

// Outgoing Composers - Room Avatar
import {ChangeMottoMessageComposer,} from './messages/outgoing/room/avatar';

// Outgoing Composers - Room Action (new)
import {AmbassadorAlertMessageComposer,} from './messages/outgoing/room/action';

// Outgoing Composers - Room Furniture
import {
	CreditFurniRedeemMessageComposer,
	OpenPetPackageMessageComposer,
	PresentOpenMessageComposer,
	RoomDimmerChangeStateComposer,
	RoomDimmerGetPresetsComposer,
	RoomDimmerSavePresetComposer,
	UpdateClothingChangeFurnitureComposer,
} from './messages/outgoing/room/furniture';

// Outgoing Composers - Room Pet
import {
	CompostPlantComposer,
	DismountPetComposer,
	GetPetCommandsComposer,
	HarvestPetComposer,
	MountPetComposer,
	PickUpPetComposer,
	RemoveSaddleFromPetComposer,
	TogglePetBreedingPermissionComposer,
	TogglePetRidingPermissionComposer,
	UseProductForPetComposer,
} from './messages/outgoing/room/pet';

// Outgoing Composers - Poll
import {
	PollAnswerComposer,
	PollRejectComposer,
	PollStartComposer,
} from './messages/outgoing/poll';

// Outgoing Composers - Friendlist
import {VisitUserMessageComposer,} from './messages/outgoing/friendlist';

// Outgoing Composers - Inventory
import {
	AcceptTradingComposer,
	AddItemToTradeComposer,
	AvatarEffectActivatedComposer,
	AvatarEffectSelectedComposer,
	CloseTradingComposer,
	ConfirmAcceptTradingComposer,
	ConfirmDeclineTradingComposer,
	GetBadgesComposer,
	GetBotInventoryComposer,
	GetPetInventoryComposer,
	OpenTradingComposer,
	RemoveItemFromTradeComposer,
	RequestFurniInventoryComposer,
	ResetUnseenItemsComposer,
	SetActivatedBadgesComposer,
	UnacceptTradingComposer,
} from './messages/outgoing/inventory';

/**
 * Habbo message configuration
 * Maps message IDs to their composer and event classes
 */
export class HabboMessages implements IMessageConfiguration
{
	constructor()
	{
		this.registerEvents();
		this.registerComposers();
	}

	private _events: Map<number, EventClass> = new Map();

	get events(): Map<number, EventClass>
	{
		return this._events;
	}

	private _composers: Map<number, ComposerClass> = new Map();

	get composers(): Map<number, ComposerClass>
	{
		return this._composers;
	}

	/**
	 * Register incoming message events (Server -> Client)
	 */
	private registerEvents(): void
	{
		// === HANDSHAKE ===
		this._events.set(771, InitDiffieHandshakeMessageEvent);
		this._events.set(3777, CompleteDiffieHandshakeMessageEvent);
		this._events.set(2323, AuthenticationOKMessageEvent);
		this._events.set(3974, UniqueMachineIdMessageEvent);
		this._events.set(4000, DisconnectReasonMessageEvent);

		// === SESSION ===
		this._events.set(658, PingMessageEvent);
		this._events.set(598, GenericErrorMessageEvent);
		this._events.set(1416, UserRightsMessageEvent);
		this._events.set(3048, UserObjectMessageEvent);
		this._events.set(1916, NoobnessLevelMessageEvent);

		// === AVAILABILITY ===
		this._events.set(3449, AvailabilityStatusMessageEvent);
		this._events.set(3728, LoginFailedHotelClosedMessageEvent);
		this._events.set(1350, MaintenanceStatusMessageEvent);

		// === AVATAR ===
		this._events.set(836, FigureUpdateMessageEvent);

		// === NAVIGATOR ===
		this._events.set(895, NavigatorSettingsMessageEvent);
		this._events.set(2676, FavouritesMessageEvent);
		this._events.set(3523, FavouriteChangedMessageEvent);
		this._events.set(2048, GetGuestRoomResultMessageEvent);
		this._events.set(34, GuestRoomSearchResultMessageEvent);
		this._events.set(523, UserFlatCatsMessageEvent);
		this._events.set(804, UserEventCatsMessageEvent);
		this._events.set(3210, PopularRoomTagsResultMessageEvent);
		this._events.set(215, OfficialRoomsMessageEvent);
		this._events.set(965, CategoriesWithVisitorCountMessageEvent);
		this._events.set(3627, CanCreateRoomMessageEvent);
		this._events.set(1722, CanCreateRoomEventMessageEvent);
		this._events.set(1489, FlatCreatedMessageEvent);
		this._events.set(1183, RoomRatingMessageEvent);
		this._events.set(1773, RoomInfoUpdatedMessageEvent);
		this._events.set(1546, DoorbellMessageEvent);
		this._events.set(3037, RoomEventMessageEvent);
		this._events.set(805, RoomEventCancelMessageEvent);
		this._events.set(1906, FlatAccessDeniedMessageEvent);
		this._events.set(574, ConvertedRoomIdMessageEvent);
		this._events.set(739, CompetitionRoomsDataMessageEvent);

		// === NOTIFICATIONS ===
		this._events.set(2875, ActivityPointsMessageEvent);
		this._events.set(114, InfoFeedEnableMessageEvent);

		// === INVENTORY ===
		this._events.set(464, FigureSetIdsMessageEvent);
		this._events.set(1196, AchievementsScoreMessageEvent);
		this._events.set(1119, AvatarEffectsMessageEvent);

		// === INVENTORY - FURNI ===
		this._events.set(3550, FurniListMessageEvent);
		this._events.set(3595, FurniListAddOrUpdateMessageEvent);
		this._events.set(3691, FurniListRemoveMessageEvent);
		this._events.set(2386, FurniListInvalidateMessageEvent);

		// === INVENTORY - BADGES ===
		this._events.set(1993, BadgesMessageEvent);

		// === INVENTORY - PETS ===
		this._events.set(2327, PetInventoryMessageEvent);

		// === INVENTORY - BOTS ===
		this._events.set(2161, BotInventoryMessageEvent);

		// === INVENTORY - TRADING ===
		this._events.set(1, TradingOpenMessageEvent);
		this._events.set(308, TradingCloseMessageEvent);
		this._events.set(1011, TradingAcceptMessageEvent);
		this._events.set(2807, TradingItemListMessageEvent);
		this._events.set(1376, TradingCompletedMessageEvent);
		this._events.set(1564, TradingConfirmationMessageEvent);
		this._events.set(2498, TradingNotOpenMessageEvent);

		// === INVENTORY - UNSEEN ===
		this._events.set(1654, UnseenItemsMessageEvent);

		// === MYSTERY BOX ===
		this._events.set(351, MysteryBoxKeysMessageEvent);

		// === CATALOG ===
		this._events.set(3907, BuildersClubSubscriptionStatusMessageEvent);

		// === HANDSHAKE (continued) ===
		this._events.set(3129, IsFirstLoginOfDayMessageEvent);

		// === NEW NAVIGATOR ===
		this._events.set(3718, NavigatorMetaDataMessageEvent);
		this._events.set(1245, NavigatorSearchResultSetMessageEvent);
		this._events.set(1134, NavigatorSavedSearchesMessageEvent);
		this._events.set(1310, NavigatorLiftedRoomsMessageEvent);
		this._events.set(1396, NavigatorCollapsedCategoriesMessageEvent);
		this._events.set(3658, NavigatorWindowSettingsMessageEvent);

		// === ROOM SESSION ===
		this._events.set(3024, RoomReadyMessageEvent);
		this._events.set(327, OpenConnectionMessageEvent);
		this._events.set(431, FlatAccessibleMessageEvent);
		this._events.set(2893, CloseConnectionMessageEvent);

		// === ROOM PERMISSIONS ===
		this._events.set(3116, YouAreControllerMessageEvent);
		this._events.set(3915, YouAreOwnerMessageEvent);

		// === ROOM ENGINE ===
		this._events.set(1270, FloorHeightMapMessageEvent);
		this._events.set(382, FurnitureAliasesMessageEvent);
		this._events.set(3492, HeightMapMessageEvent);
		this._events.set(2948, HeightMapUpdateMessageEvent);
		this._events.set(1580, RoomEntryTileMessageEvent);
		this._events.set(2791, RoomEntryInfoMessageEvent);
		this._events.set(1572, ObjectsMessageEvent);
		this._events.set(3122, ObjectAddMessageEvent);
		this._events.set(3075, ObjectUpdateMessageEvent);
		this._events.set(3233, ObjectRemoveMessageEvent);
		this._events.set(3007, ObjectDataUpdateMessageEvent);
		this._events.set(3514, ItemsMessageEvent);
		this._events.set(684, ItemAddMessageEvent);
		this._events.set(2101, ItemUpdateMessageEvent);
		this._events.set(1093, ItemRemoveMessageEvent);
		this._events.set(2846, UsersMessageEvent);
		this._events.set(3911, UserUpdateMessageEvent);
		this._events.set(2193, UserRemoveMessageEvent);
		this._events.set(1661, SlideObjectBundleMessageEvent);

		// === ROOM CHAT ===
		this._events.set(1632, ChatMessageEvent);
		this._events.set(3554, ShoutMessageEvent);
		this._events.set(2834, WhisperMessageEvent);
		this._events.set(1780, UserTypingMessageEvent);

		// === ROOM ACTION ===
		this._events.set(3855, ExpressionMessageEvent);
		this._events.set(558, DanceMessageEvent);
		this._events.set(1767, AvatarEffectMessageEvent);
		this._events.set(807, SleepMessageEvent);
		this._events.set(1299, CarryObjectMessageEvent);
		this._events.set(2675, UseObjectMessageEvent);
		this._events.set(2680, UserChangeMessageEvent);

		// === ROOM FURNITURE ===
		this._events.set(2710, RoomDimmerPresetsMessageEvent);
		this._events.set(56, PresentOpenedMessageEvent);
		this._events.set(2380, OpenPetPackageRequestedMessageEvent);
		this._events.set(546, OpenPetPackageResultMessageEvent);

		// === POLL / WORD QUIZ ===
		this._events.set(3785, PollOfferEvent);
		this._events.set(662, PollErrorEvent);
		this._events.set(2997, PollContentsEvent);
		this._events.set(2665, QuestionEvent);
		this._events.set(2589, QuestionAnsweredEvent);
		this._events.set(1066, QuestionFinishedEvent);
	}

	/**
	 * Register outgoing message composers (Client -> Server)
	 */
	private registerComposers(): void
	{
		// === HANDSHAKE ===
		this._composers.set(4000, ClientHelloMessageComposer);
		this._composers.set(586, InitDiffieHandshakeMessageComposer);
		this._composers.set(2616, CompleteDiffieHandshakeMessageComposer);
		this._composers.set(2602, VersionCheckMessageComposer);
		this._composers.set(53, SSOTicketMessageComposer);
		this._composers.set(1390, UniqueIDMessageComposer);

		// === SESSION ===
		this._composers.set(2331, PongMessageComposer);
		this._composers.set(1113, DisconnectMessageComposer);
		this._composers.set(245, InfoRetrieveMessageComposer);

		// === TRACKING ===
		this._composers.set(2297, EventLogMessageComposer);

		// === NAVIGATOR ===
		this._composers.set(1561, GetGuestRoomMessageComposer);
		this._composers.set(3526, CreateFlatMessageComposer);
		this._composers.set(915, AddFavouriteRoomMessageComposer);
		this._composers.set(79, DeleteFavouriteRoomMessageComposer);
		this._composers.set(3236, RoomTextSearchMessageComposer);
		this._composers.set(324, PopularRoomsSearchMessageComposer);
		this._composers.set(3540, MyRoomsSearchMessageComposer);
		this._composers.set(2673, MyFavouriteRoomsSearchMessageComposer);
		this._composers.set(2089, GetOfficialRoomsMessageComposer);
		this._composers.set(2897, CanCreateRoomMessageComposer);
		this._composers.set(315, GetUserFlatCatsMessageComposer);
		this._composers.set(1679, GetUserEventCatsMessageComposer);
		this._composers.set(2188, UpdateHomeRoomMessageComposer);
		this._composers.set(2080, RateFlatMessageComposer);
		this._composers.set(1210, ToggleStaffPickMessageComposer);
		this._composers.set(3900, GetPopularRoomTagsMessageComposer);
		this._composers.set(2171, MyFriendsRoomsSearchMessageComposer);
		this._composers.set(524, ForwardToSomeRoomMessageComposer);
		this._composers.set(2889, ConvertGlobalRoomIdMessageComposer);
		this._composers.set(1684, CancelEventMessageComposer);
		this._composers.set(692, EditEventMessageComposer);
		this._composers.set(3578, CompetitionRoomsSearchMessageComposer);
		this._composers.set(1890, RoomsWithHighestScoreSearchMessageComposer);
		this._composers.set(1105, RoomsWhereMyFriendsAreSearchMessageComposer);
		this._composers.set(3392, MyRoomHistorySearchMessageComposer);
		this._composers.set(3783, MyFrequentRoomHistorySearchMessageComposer);
		this._composers.set(283, MyRoomRightsSearchMessageComposer);
		this._composers.set(3530, MyGuildBasesSearchMessageComposer);
		this._composers.set(1686, MyRecommendedRoomsMessageComposer);
		this._composers.set(2806, GuildBaseSearchMessageComposer);
		this._composers.set(790, SetRoomSessionTagsMessageComposer);
		this._composers.set(1526, RoomAdSearchMessageComposer);
		this._composers.set(1189, RemoveOwnRoomRightsRoomMessageComposer);
		this._composers.set(1199, RoomAdEventTabAdClickedComposer);
		this._composers.set(1472, RoomAdEventTabViewedComposer);

		// === NEW NAVIGATOR ===
		this._composers.set(3032, NewNavigatorInitComposer);
		this._composers.set(657, NewNavigatorSearchComposer);
		this._composers.set(403, NavigatorAddSavedSearchComposer);
		this._composers.set(3162, NavigatorDeleteSavedSearchComposer);
		this._composers.set(494, NavigatorAddCollapsedCategoryMessageComposer);
		this._composers.set(141, NavigatorRemoveCollapsedCategoryMessageComposer);
		this._composers.set(1108, NavigatorSetSearchCodeViewModeMessageComposer);

		// === ROOM SESSION ===
		this._composers.set(2729, OpenFlatConnectionMessageComposer);
		this._composers.set(3093, ChangeQueueMessageComposer);

		// === ROOM AVATAR ===
		this._composers.set(2228, ChangeMottoMessageComposer);

		// === ROOM ACTION (additional) ===
		this._composers.set(2996, AmbassadorAlertMessageComposer);

		// === ROOM FURNITURE ===
		this._composers.set(3115, CreditFurniRedeemMessageComposer);
		this._composers.set(3558, PresentOpenMessageComposer);
		this._composers.set(3698, OpenPetPackageMessageComposer);
		this._composers.set(2813, RoomDimmerGetPresetsComposer);
		this._composers.set(1648, RoomDimmerSavePresetComposer);
		this._composers.set(2296, RoomDimmerChangeStateComposer);
		this._composers.set(924, UpdateClothingChangeFurnitureComposer);

		// === ROOM PET ===
		this._composers.set(1581, PickUpPetComposer);
		this._composers.set(1036, MountPetComposer); // Also used for dismount (same ID, server toggles)
		this._composers.set(1472, TogglePetRidingPermissionComposer);
		this._composers.set(186, RemoveSaddleFromPetComposer);
		this._composers.set(2161, GetPetCommandsComposer);
		this._composers.set(1521, HarvestPetComposer);
		this._composers.set(3379, TogglePetBreedingPermissionComposer);
		this._composers.set(3835, CompostPlantComposer);
		this._composers.set(3202, UseProductForPetComposer);

		// === POLL ===
		this._composers.set(109, PollStartComposer);
		this._composers.set(1773, PollRejectComposer);
		this._composers.set(3505, PollAnswerComposer);

		// === FRIENDLIST ===
		this._composers.set(2970, VisitUserMessageComposer);

		// === ROOM ENGINE ===
		this._composers.set(2064, GetFurnitureAliasesMessageComposer);
		this._composers.set(1935, GetHeightMapMessageComposer);

		// === ROOM CHAT ===
		this._composers.set(2057, ChatMessageComposer);
		this._composers.set(380, ShoutMessageComposer);
		this._composers.set(2065, WhisperMessageComposer);

		// === INVENTORY ===
		this._composers.set(3181, RequestFurniInventoryComposer);
		this._composers.set(1047, GetBadgesComposer);
		this._composers.set(1267, SetActivatedBadgesComposer);
		this._composers.set(1967, GetPetInventoryComposer);
		this._composers.set(541, GetBotInventoryComposer);
		this._composers.set(90, AvatarEffectActivatedComposer);
		this._composers.set(1393, AvatarEffectSelectedComposer);
		this._composers.set(3343, ResetUnseenItemsComposer);

		// === INVENTORY - TRADING ===
		this._composers.set(3040, OpenTradingComposer);
		this._composers.set(1781, CloseTradingComposer);
		this._composers.set(1746, AcceptTradingComposer);
		this._composers.set(1779, UnacceptTradingComposer);
		this._composers.set(1918, ConfirmAcceptTradingComposer);
		this._composers.set(1626, ConfirmDeclineTradingComposer);
		this._composers.set(3472, AddItemToTradeComposer);
		this._composers.set(1709, RemoveItemFromTradeComposer);
	}
}
