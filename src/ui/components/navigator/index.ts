// Main Navigator components
export {Navigator} from './Navigator';
export {NavigatorWindow} from './NavigatorWindow';
export type {INavigatorWindowProps} from './NavigatorWindow';

// Common components
export {
	NavigatorIcon,
	NavigatorButton,
	IconButton,
	NavigatorHeader,
	Skeleton,
	RoomCardSkeleton,
	RoomCardCompactSkeleton,
	CategoryItemSkeleton,
	TabSkeleton,
	ProgressBar,
	UserCountBar,
} from './common';
export type {
	INavigatorIconProps,
	IconName,
	INavigatorButtonProps,
	IIconButtonProps,
	INavigatorHeaderProps,
	ISkeletonProps,
	IProgressBarProps,
} from './common';

// Tab components
export {INavigatorTab, NavigatorTabs} from './tabs';
export type {INavigatorTabProps, INavigatorTabsProps, ITabDefinition} from './tabs';

// Room components
export {RoomCard, RoomCardCompact, RoomList, LiftedRoomsSection, RoomEventsSection} from './rooms';
export type {
	IRoomCardProps,
	IRoomCardCompactProps,
	IRoomListProps,
	IRoomListRoom,
	RoomListViewMode,
	ILiftedRoomsSectionProps,
	ILiftedRoom,
	IRoomEventsSectionProps,
	IRoomEvent,
} from './rooms';

// Room info components
export {
	RoomInfoHeader,
	RoomInfoDetails,
	RoomInfoActions,
	RoomInfoPanel,
} from './roominfo';
export type {
	IRoomInfoHeaderProps,
	IRoomInfoDetailsProps,
	IRoomInfoActionsProps,
	IRoomInfoPanelProps,
	IRoomInfoData,
} from './roominfo';

// Search components
export {NavigatorSearch, PopularTags, SearchResults, SavedSearches} from './search';
export type {
	INavigatorSearchProps,
	IPopularTagsProps,
	IPopularTag,
	ISearchResultsProps,
	ISavedSearchesProps,
	ISavedSearch,
} from './search';

// ICategory components
export {CategoryItem, CategoryList} from './categories';
export type {ICategoryItemProps, ICategoryListProps, ICategory} from './categories';

// Room creation components
export {RoomCreateForm, RoomCreateModal} from './create';
export type {
	IRoomCreateFormProps,
	IRoomCreateFormData,
	IRoomCategory,
	IRoomModel,
	IRoomCreateModalProps,
} from './create';

// Modal components
export {DoorbellModal, PasswordModal} from './modals';
export type {
	IDoorbellModalProps,
	DoorbellStatus,
	IPasswordModalProps,
} from './modals';

// Hooks
export {useDraggable} from './hooks/useDraggable';
export type {IDraggablePosition, IUseDraggableOptions, IUseDraggableReturn} from './hooks/useDraggable';
export {useNavigatorLocalization, NAV_KEYS} from './hooks/useLocalization';

// Utils
export {
	mapGuestRoomToListRoom,
	mapGuestRoomsToListRooms,
	mapSearchResultsToListRooms,
} from './utils';
