// Main Navigator components
export {Navigator} from './Navigator';
export {NavigatorWindow} from './NavigatorWindow';
export type {NavigatorWindowProps} from './NavigatorWindow';

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
	NavigatorIconProps,
	IconName,
	NavigatorButtonProps,
	IconButtonProps,
	NavigatorHeaderProps,
	SkeletonProps,
	ProgressBarProps,
} from './common';

// Tab components
export {NavigatorTab, NavigatorTabs} from './tabs';
export type {NavigatorTabProps, NavigatorTabsProps, TabDefinition} from './tabs';

// Room components
export {RoomCard, RoomCardCompact, RoomList, NavigatorBlockSection, LiftedRoomsSection, RoomEventsSection} from './rooms';
export type {
	RoomCardProps,
	RoomCardCompactProps,
	RoomListProps,
	RoomListRoom,
	RoomListViewMode,
	NavigatorBlockData,
	NavigatorBlockSectionProps,
	LiftedRoomsSectionProps,
	LiftedRoom,
	RoomEventsSectionProps,
	RoomEvent,
} from './rooms';

// Room info components
export {
	RoomInfoHeader,
	RoomInfoDetails,
	RoomInfoActions,
	RoomInfoPanel,
} from './roominfo';
export type {
	RoomInfoHeaderProps,
	RoomInfoDetailsProps,
	RoomInfoActionsProps,
	RoomInfoPanelProps,
	RoomInfoData,
} from './roominfo';

// Search components
export {NavigatorSearch, PopularTags, SearchResults, SavedSearches} from './search';
export type {
	NavigatorSearchProps,
	PopularTagsProps,
	PopularTag,
	SearchResultsProps,
	SavedSearchesProps,
	SavedSearch,
} from './search';

// Category components
export {CategoryItem, CategoryList} from './categories';
export type {CategoryItemProps, CategoryListProps, Category} from './categories';

// Room creation components
export {RoomCreateForm, RoomCreateModal} from './create';
export type {
	RoomCreateFormProps,
	RoomCreateFormData,
	RoomCategory,
	RoomModel,
	RoomCreateModalProps,
} from './create';

// Modal components
export {DoorbellModal, PasswordModal} from './modals';
export type {
	DoorbellModalProps,
	DoorbellStatus,
	PasswordModalProps,
} from './modals';

// Hooks
export {useDraggable} from '../../hooks/useDraggable';
export type {DraggablePosition, UseDraggableOptions, UseDraggableReturn} from '../../hooks/useDraggable';
export {useNavigatorLocalization, NAV_KEYS} from './hooks/useLocalization';

// Utils
export {
	mapGuestRoomToListRoom,
	mapGuestRoomsToListRooms,
	mapSearchResultsToListRooms,
	mapSearchResultsToBlocks,
} from './utils';
