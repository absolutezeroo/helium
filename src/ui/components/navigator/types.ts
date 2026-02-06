import type {JSX} from 'solid-js';
import type {EventCategory, FlatCategory, GuestRoomData} from '@habbo/communication/messages/incoming/navigator';

/**
 * Navigator tab definition
 */
export interface INavigatorTab
{
	id: string;
	label: string;
	icon?: string;
	view: NavigatorView;
}

/**
 * Navigator view types
 */
export type NavigatorView =
	| 'hotel'
	| 'rooms'
	| 'me'
	| 'official'
	| 'search'
	| 'events';

/**
 * Room display mode
 */
export type RoomDisplayMode = 'grid' | 'list' | 'compact';

/**
 * Room card props
 */
export interface IRoomCardProps
{
	room: GuestRoomData;
	isFavourite?: boolean;
	isHome?: boolean;
	showOwner?: boolean;
	showUserCount?: boolean;
	showRating?: boolean;
	showTags?: boolean;
	onClick?: (room: GuestRoomData) => void;
	onFavouriteClick?: (room: GuestRoomData) => void;
	onEnterClick?: (room: GuestRoomData) => void;
	class?: string;
}

/**
 * Room list props
 */
export interface IRoomListProps
{
	rooms: GuestRoomData[];
	displayMode?: RoomDisplayMode;
	emptyMessage?: string;
	loading?: boolean;
	onRoomClick?: (room: GuestRoomData) => void;
	onRoomEnter?: (room: GuestRoomData) => void;
	renderRoom?: (room: GuestRoomData, index: number) => JSX.Element;
	class?: string;
}

/**
 * ICategory item props
 */
export interface ICategoryItemProps
{
	category: FlatCategory | EventCategory;
	isSelected?: boolean;
	showCount?: boolean;
	onClick?: (category: FlatCategory | EventCategory) => void;
	class?: string;
}

/**
 * Search props
 */
export interface ISearchProps
{
	placeholder?: string;
	onSearch?: (query: string) => void;
	onTagClick?: (tag: string) => void;
	class?: string;
}

/**
 * Navigator theme configuration
 */
export interface INavigatorTheme
{
	// Window
	windowBg?: string;
	windowBorder?: string;
	windowShadow?: string;

	// Header
	headerBg?: string;
	headerText?: string;

	// Tabs
	tabBg?: string;
	tabBgActive?: string;
	tabText?: string;
	tabTextActive?: string;

	// Content
	contentBg?: string;

	// Room cards
	cardBg?: string;
	cardBgHover?: string;
	cardBorder?: string;
	cardText?: string;
	cardTextSecondary?: string;

	// Buttons
	buttonPrimary?: string;
	buttonSecondary?: string;
	buttonDanger?: string;

	// Icons
	iconFavourite?: string;
	iconHome?: string;
	iconLock?: string;
	iconUsers?: string;
}

/**
 * Default navigator theme
 */
export const defaultNavigatorTheme: INavigatorTheme = {
	windowBg: 'bg-slate-800',
	windowBorder: 'border-slate-600',
	windowShadow: 'shadow-xl',
	headerBg: 'bg-slate-700',
	headerText: 'text-white',
	tabBg: 'bg-slate-700',
	tabBgActive: 'bg-blue-600',
	tabText: 'text-slate-300',
	tabTextActive: 'text-white',
	contentBg: 'bg-slate-800',
	cardBg: 'bg-slate-700',
	cardBgHover: 'hover:bg-slate-600',
	cardBorder: 'border-slate-600',
	cardText: 'text-white',
	cardTextSecondary: 'text-slate-400',
	buttonPrimary: 'bg-blue-600 hover:bg-blue-500',
	buttonSecondary: 'bg-slate-600 hover:bg-slate-500',
	buttonDanger: 'bg-red-600 hover:bg-red-500',
	iconFavourite: 'text-yellow-400',
	iconHome: 'text-green-400',
	iconLock: 'text-orange-400',
	iconUsers: 'text-blue-400',
};
