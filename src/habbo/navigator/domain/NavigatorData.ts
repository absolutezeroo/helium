import type {
	CategoriesWithVisitorCountData,
	CompetitionRoomsData,
	EventCategory,
	FlatCategory,
	GuestRoomData,
	GuestRoomSearchResultData,
	INavigatorSearchResultData,
	OfficialRoomEntryData,
	OfficialRoomsData,
	PopularTagsData,
	PromotedRoomsData,
	RoomEventData,
} from '../../communication/messages/incoming/navigator';
import type {
	NavigatorSearchResultSet,
	NavigatorTopLevelContext,
} from '../../communication/messages/incoming/newnavigator';

/**
 * Navigator data domain model
 *
 * Based on AS3 com.sulake.habbo.navigator.domain.NavigatorData
 */
export class NavigatorData
{
	private _lastMessage: INavigatorSearchResultData | null = null;
	private _favouriteLimit: number = 0;
	private _favouriteCount: number = 0;
	private _favouriteRoomIds: Map<number, boolean> = new Map();
	private _isLoading: boolean = false;

	private _roomEventData: RoomEventData | null = null;

	get roomEventData(): RoomEventData | null
	{
		return this._roomEventData;
	}

	set roomEventData(value: RoomEventData | null)
	{
		this._roomEventData = value;
	}

	private _eventMod: boolean = false;

	get eventMod(): boolean
	{
		return this._eventMod;
	}

	set eventMod(value: boolean)
	{
		this._eventMod = value;
	}

	private _roomPicker: boolean = false;

	get roomPicker(): boolean
	{
		return this._roomPicker;
	}

	set roomPicker(value: boolean)
	{
		this._roomPicker = value;
	}

	private _currentRoomOwner: boolean = false;

	get currentRoomOwner(): boolean
	{
		return this._currentRoomOwner;
	}

	private _currentRoomId: number = 0;

	get currentRoomId(): number
	{
		return this._currentRoomId;
	}

	private _avatarId: number = 0;

	get avatarId(): number
	{
		return this._avatarId;
	}

	set avatarId(value: number)
	{
		this._avatarId = value;
	}

	private _enteredGuestRoom: GuestRoomData | null = null;

	get enteredGuestRoom(): GuestRoomData | null
	{
		return this._enteredGuestRoom;
	}

	set enteredGuestRoom(value: GuestRoomData | null)
	{
		if (this._enteredGuestRoom !== null)
		{
			this._enteredGuestRoom.dispose();
		}

		this._enteredGuestRoom = value;

		if (value)
		{
		}
	}

	private _hcMember: boolean = false;

	get hcMember(): boolean
	{
		return this._hcMember;
	}

	set hcMember(value: boolean)
	{
		this._hcMember = value;
	}

	private _createdFlatId: number = 0;

	get createdFlatId(): number
	{
		return this._createdFlatId;
	}

	set createdFlatId(value: number)
	{
		this._createdFlatId = value;
	}

	// ========== Room Entry/Exit ==========

	private _hotRoomPopupOpen: boolean = false;

	get hotRoomPopupOpen(): boolean
	{
		return this._hotRoomPopupOpen;
	}

	set hotRoomPopupOpen(value: boolean)
	{
		this._hotRoomPopupOpen = value;
	}

	private _homeRoomId: number = 0;

	// ========== Entered Room ==========

	get homeRoomId(): number
	{
		return this._homeRoomId;
	}

	set homeRoomId(value: number)
	{
		this._homeRoomId = value;
	}

	// ========== Room Event Data ==========

	private _settingsReceived: boolean = false;

	get settingsReceived(): boolean
	{
		return this._settingsReceived;
	}

	// ========== Search Results ==========

	set settingsReceived(value: boolean)
	{
		this._settingsReceived = value;
	}

	private _allCategories: FlatCategory[] = [];

	get allCategories(): FlatCategory[]
	{
		return this._allCategories;
	}

	private _visibleCategories: FlatCategory[] = [];

	get visibleCategories(): FlatCategory[]
	{
		return this._visibleCategories;
	}

	private _allEventCategories: EventCategory[] = [];

	get allEventCategories(): EventCategory[]
	{
		return this._allEventCategories;
	}

	private _visibleEventCategories: EventCategory[] = [];

	get visibleEventCategories(): EventCategory[]
	{
		return this._visibleEventCategories;
	}

	private _currentRoomRating: number = 0;

	get currentRoomRating(): number
	{
		return this._currentRoomRating;
	}

	set currentRoomRating(value: number)
	{
		this._currentRoomRating = value;
	}

	private _canRate: boolean = false;

	// ========== Ad Room ==========

	get canRate(): boolean
	{
		return this._canRate;
	}

	set canRate(value: boolean)
	{
		this._canRate = value;
	}

	// ========== Promoted Rooms ==========

	private _currentRoomIsStaffPick: boolean = false;

	get currentRoomIsStaffPick(): boolean
	{
		return this._currentRoomIsStaffPick;
	}

	// ========== Basic Properties ==========

	set currentRoomIsStaffPick(value: boolean)
	{
		this._currentRoomIsStaffPick = value;
	}

	private _adIndex: number = 0;

	get adIndex(): number
	{
		return this._adIndex;
	}

	set adIndex(value: number)
	{
		this._adIndex = value;
	}

	private _adRoom: OfficialRoomEntryData | null = null;

	get adRoom(): OfficialRoomEntryData | null
	{
		return this._adRoom;
	}

	set adRoom(value: OfficialRoomEntryData | null)
	{
		this._adRoom = value;
	}

	private _promotedRooms: PromotedRoomsData | null = null;

	get promotedRooms(): PromotedRoomsData | null
	{
		return this._promotedRooms;
	}

	set promotedRooms(value: PromotedRoomsData | null)
	{
		this._promotedRooms = value;
	}

	private _competitionRoomsData: CompetitionRoomsData | null = null;

	get competitionRoomsData(): CompetitionRoomsData | null
	{
		return this._competitionRoomsData;
	}

	set competitionRoomsData(value: CompetitionRoomsData | null)
	{
		this._competitionRoomsData = value;
	}

	// New Navigator data
	private _topLevelContexts: NavigatorTopLevelContext[] = [];

	get topLevelContexts(): NavigatorTopLevelContext[]
	{
		return this._topLevelContexts;
	}

	set topLevelContexts(value: NavigatorTopLevelContext[])
	{
		this._topLevelContexts = value;
	}

	private _navigatorSearchResultSet: NavigatorSearchResultSet | null = null;

	get navigatorSearchResultSet(): NavigatorSearchResultSet | null
	{
		return this._navigatorSearchResultSet;
	}

	set navigatorSearchResultSet(value: NavigatorSearchResultSet | null)
	{
		this._navigatorSearchResultSet = value;

		this._isLoading = false;
	}

	get canAddFavourite(): boolean
	{
		return this._enteredGuestRoom !== null && !this._currentRoomOwner;
	}

	get canEditRoomSettings(): boolean
	{
		return this._enteredGuestRoom !== null && this._currentRoomOwner;
	}

	get popularTagsArrived(): boolean
	{
		return this._lastMessage !== null && 'tags' in this._lastMessage;
	}

	get guestRoomSearchArrived(): boolean
	{
		return this._lastMessage !== null && 'rooms' in this._lastMessage;
	}

	get officialRoomsArrived(): boolean
	{
		return this._lastMessage !== null && 'entries' in this._lastMessage;
	}

	get categoriesWithUserCountArrived(): boolean
	{
		return this._lastMessage !== null && 'categories' in this._lastMessage;
	}

	get guestRoomSearchResults(): GuestRoomSearchResultData | null
	{
		return this._lastMessage as GuestRoomSearchResultData | null;
	}

	// ========== Categories ==========

	set guestRoomSearchResults(value: GuestRoomSearchResultData | null)
	{
		this.disposeCurrentMessage();

		this._lastMessage = value;

		if (value)
		{
			this._adRoom = value.ad;
		}

		this._isLoading = false;
	}

	get popularTags(): PopularTagsData | null
	{
		return this._lastMessage as PopularTagsData | null;
	}

	set popularTags(value: PopularTagsData | null)
	{
		this.disposeCurrentMessage();

		this._lastMessage = value;
		this._isLoading = false;
	}

	get officialRooms(): OfficialRoomsData | null
	{
		return this._lastMessage as OfficialRoomsData | null;
	}

	// ========== Event Categories ==========

	set officialRooms(value: OfficialRoomsData | null)
	{
		this.disposeCurrentMessage();

		this._lastMessage = value;
		this._isLoading = false;
	}

	get categoriesWithVisitorData(): CategoriesWithVisitorCountData | null
	{
		return this._lastMessage as CategoriesWithVisitorCountData | null;
	}

	set categoriesWithVisitorData(value: CategoriesWithVisitorCountData | null)
	{
		this.disposeCurrentMessage();

		this._lastMessage = value;
		this._isLoading = false;
	}

	set categories(value: FlatCategory[])
	{
		this._allCategories = value;

		this._visibleCategories = value.filter((cat) => cat.visible);
	}

	// ========== Favourites ==========

	set eventCategories(value: EventCategory[])
	{
		this._allEventCategories = value;

		this._visibleEventCategories = value.filter((cat) => cat.visible);
	}

	onRoomEnter(guestRoomId: number, isOwner: boolean): void
	{
		this._enteredGuestRoom = null;
		this._currentRoomOwner = isOwner;
		this._currentRoomId = guestRoomId;
	}

	onRoomExit(): void
	{
		if (this._roomEventData !== null)
		{
			this._roomEventData = null;
		}

		if (this._enteredGuestRoom !== null)
		{
			this._enteredGuestRoom.dispose();
			this._enteredGuestRoom = null;
		}

		this._currentRoomOwner = false;
	}

	getCategoryById(nodeId: number): FlatCategory | null
	{
		return this._allCategories.find((cat) => cat.nodeId === nodeId) || null;
	}

	getEventCategoryById(categoryId: number): EventCategory | null
	{
		return this._allEventCategories.find((cat) => cat.categoryId === categoryId) || null;
	}

	onFavourites(limit: number, roomIds: number[]): void
	{
		this._favouriteLimit = limit;
		this._favouriteCount = roomIds.length;
		this._favouriteRoomIds.clear();

		for (const roomId of roomIds)
		{
			this._favouriteRoomIds.set(roomId, true);
		}
	}

	favouriteChanged(roomId: number, added: boolean): void
	{
		if (added)
		{
			this._favouriteRoomIds.set(roomId, true);
			this._favouriteCount++;
		} else
		{
			this._favouriteRoomIds.delete(roomId);
			this._favouriteCount--;
		}
	}

	// ========== Loading State ==========

	isCurrentRoomFavourite(): boolean
	{
		if (!this._enteredGuestRoom)
		{
			return false;
		}
		return this._favouriteRoomIds.has(this._enteredGuestRoom.flatId);
	}

	isCurrentRoomHome(): boolean
	{
		if (!this._enteredGuestRoom)
		{
			return false;
		}
		return this._homeRoomId === this._enteredGuestRoom.flatId;
	}

	// ========== Competition Rooms ==========

	isRoomFavourite(roomId: number): boolean
	{
		return this._favouriteRoomIds.has(roomId);
	}

	isFavouritesFull(): boolean
	{
		return this._favouriteCount >= this._favouriteLimit;
	}

	// ========== New Navigator Data ==========

	isRoomHome(roomId: number): boolean
	{
		return roomId === this._homeRoomId;
	}

	startLoading(): void
	{
		this._isLoading = true;
	}

	isLoading(): boolean
	{
		return this._isLoading;
	}

	dispose(): void
	{
		this.disposeCurrentMessage();

		if (this._enteredGuestRoom)
		{
			this._enteredGuestRoom.dispose();
			this._enteredGuestRoom = null;
		}

		if (this._promotedRooms)
		{
			this._promotedRooms.dispose();
			this._promotedRooms = null;
		}

		this._favouriteRoomIds.clear();

		this._allCategories = [];
		this._visibleCategories = [];
		this._allEventCategories = [];
		this._visibleEventCategories = [];
	}

	// ========== Dispose ==========

	private disposeCurrentMessage(): void
	{
		if (this._lastMessage === null)
		{
			return;
		}

		this._lastMessage.dispose();

		this._lastMessage = null;
	}
}
