import type {JSX} from 'solid-js';
import {createMemo, Show} from 'solid-js';
import type {IRoomListRoom, RoomListViewMode} from '../rooms';
import {RoomList} from '../rooms';
import {NavigatorIcon} from '../common';

export interface ISearchResultsProps
{
	rooms: IRoomListRoom[];
	query?: string;
	totalCount?: number;
	loading?: boolean;
	viewMode?: RoomListViewMode;
	onRoomClick?: (roomId: number) => void;
	onFavouriteClick?: (roomId: number) => void;
	onInfoClick?: (roomId: number) => void;
	onLoadMore?: () => void;
	hasMore?: boolean;
	class?: string;
}

/**
 * Search results component - displays search results with query info
 */
export function SearchResults(props: ISearchResultsProps): JSX.Element
{
	const resultText = createMemo(() =>
	{
		const count = props.totalCount ?? props.rooms.length;
		if (count === 0) return 'No rooms found';
		if (count === 1) return '1 room found';
		return `${count} rooms found`;
	});

	return (
		<div class={`flex flex-col ${props.class ?? ''}`}>
			{/* Results header */}
			<Show when={props.query}>
				<div class="flex items-center justify-between mb-3 px-1">
					<div class="flex items-center gap-2 text-sm">
						<NavigatorIcon name="search" size="sm" class="text-slate-400"/>
						<span class="text-slate-400">
                            Results for "<span class="text-slate-200">{props.query}</span>"
                        </span>
					</div>
					<span class="text-xs text-slate-500">
                        {resultText()}
                    </span>
				</div>
			</Show>

			{/* Room list */}
			<RoomList
				rooms={props.rooms}
				viewMode={props.viewMode}
				loading={props.loading}
				emptyMessage={props.query ? `No rooms found for "${props.query}"` : 'No rooms found'}
				onRoomClick={props.onRoomClick}
				onFavouriteClick={props.onFavouriteClick}
				onInfoClick={props.onInfoClick}
				class="flex-1 overflow-y-auto"
			/>

			{/* Load more */}
			<Show when={props.hasMore && !props.loading && props.rooms.length > 0}>
				<div class="flex justify-center mt-4">
					<button
						type="button"
						class={`
                            flex items-center gap-2
                            px-4 py-2
                            bg-slate-800 hover:bg-slate-700
                            border border-slate-700 hover:border-slate-600
                            rounded-lg
                            text-sm text-slate-300 hover:text-slate-100
                            transition-colors
                        `}
						onClick={props.onLoadMore}
					>
						<NavigatorIcon name="chevronDown" size="sm"/>
						Load more
					</button>
				</div>
			</Show>
		</div>
	);
}
