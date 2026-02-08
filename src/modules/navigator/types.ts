import type {
	EventCategory,
	FlatCategory,
	GuestRoomData,
	GuestRoomSearchResultData,
	PopularTagsData,
} from '@habbo/communication/messages/incoming/navigator';
import type {
	NavigatorSearchResultSet,
	NavigatorTopLevelContext,
} from '@habbo/communication/messages/incoming/newnavigator';

/**
 * Door state types for doorbell/password dialogs.
 *
 * @see source_nitro_react/api/navigator/DoorStateType.ts
 */
export const DoorStateType = {
	NONE: 0,
	START_DOORBELL: 1,
	STATE_WAITING: 2,
	STATE_NO_ANSWER: 3,
	START_PASSWORD: 4,
	STATE_WRONG_PASSWORD: 5,
	STATE_PENDING_SERVER: 6,
} as const;

/**
 * Door state data for doorbell/password dialogs.
 */
export interface DoorData
{
	roomInfo: GuestRoomData | null;
	state: number;
}

/**
 * Navigator module state
 */
export interface NavigatorState
{
	/** Whether the navigator window is open */
	isOpen: boolean;

	/** Whether the room info panel is open */
	isRoomInfoOpen: boolean;

	/** Whether the create room modal is open */
	isCreateModalOpen: boolean;

	/** Whether the room link view is open */
	isRoomLinkOpen: boolean;

	/** Current search code (tab) */
	currentSearchCode: string;

	/** Top-level contexts (tabs) from server */
	topLevelContexts: NavigatorTopLevelContext[];

	/** New navigator search results */
	searchResults: NavigatorSearchResultSet | null;

	/** Legacy navigator search results */
	legacySearchResults: GuestRoomSearchResultData | null;

	/** Popular room tags */
	popularTags: PopularTagsData | null;

	/** Flat (room) categories */
	flatCategories: FlatCategory[];

	/** Event categories */
	eventCategories: EventCategory[];

	/** User's home room ID */
	homeRoomId: number;

	/** Door state data for doorbell/password dialogs */
	doorData: DoorData | null;
}
