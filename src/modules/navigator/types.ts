import type {
	EventCategory,
	FlatCategory,
	GuestRoomSearchResultData,
	PopularTagsData,
} from '@habbo/communication/messages/incoming/navigator';
import type {
	NavigatorSearchResultSet,
	NavigatorTopLevelContext,
} from '@habbo/communication/messages/incoming/newnavigator';

/**
 * Navigator module state
 */
export interface NavigatorState
{
	// ========== UI State ==========

	/** Whether the navigator window is open */
	isOpen: boolean;

	/** Whether the room info panel is open */
	isRoomInfoOpen: boolean;

	/** Whether the create room modal is open */
	isCreateModalOpen: boolean;

	// ========== Search State ==========

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

	// ========== Categories ==========

	/** Flat (room) categories */
	flatCategories: FlatCategory[];

	/** Event categories */
	eventCategories: EventCategory[];

	// ========== Settings ==========

	/** User's home room ID */
	homeRoomId: number;
}
