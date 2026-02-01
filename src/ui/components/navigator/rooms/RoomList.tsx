import type {JSX} from 'solid-js';
import {createMemo, For, Show} from 'solid-js';
import {RoomCard} from './RoomCard';
import {RoomCardCompact} from './RoomCardCompact';
import {NavigatorIcon} from '../common';

export type RoomListViewMode = 'cards' | 'compact' | 'grid';

export interface RoomListRoom
{
	id: number;
	name: string;
	ownerName: string;
	description?: string;
	userCount: number;
	maxUserCount: number;
	thumbnail?: string;
	tags?: string[];
	isFavourite?: boolean;
	isGroupRoom?: boolean;
	isStaffPick?: boolean;
	doorMode?: 'open' | 'doorbell' | 'password' | 'invisible';
	score?: number;
	categoryId?: number;
}

export interface RoomListProps
{
	rooms: RoomListRoom[];
	viewMode?: RoomListViewMode;
	emptyMessage?: string;
	loading?: boolean;
	onRoomClick?: (roomId: number) => void;
	onFavouriteClick?: (roomId: number) => void;
	onInfoClick?: (roomId: number) => void;
	class?: string;
}

/**
 * Room list component - displays a list of rooms with different view modes
 */
export function RoomList(props: RoomListProps): JSX.Element
{
	const viewMode = () => props.viewMode ?? 'cards';

	const containerClass = createMemo(() =>
	{
		switch (viewMode())
		{
			case 'grid':
				return 'grid grid-cols-2 gap-3';
			case 'compact':
				return 'flex flex-col divide-y divide-slate-700/50';
			default:
				return 'flex flex-col gap-2';
		}
	});

	return (
		<div class={`${props.class ?? ''}`}>
			{/* Loading state */}
			<Show when={props.loading}>
				<div class="flex items-center justify-center py-8">
					<div class="flex items-center gap-2 text-slate-400">
						<NavigatorIcon name="loading" size="md" class="animate-spin"/>
						<span>Loading rooms...</span>
					</div>
				</div>
			</Show>

			{/* Empty state */}
			<Show when={!props.loading && props.rooms.length === 0}>
				<div class="flex flex-col items-center justify-center py-8 text-center">
					<NavigatorIcon name="room" size="xl" class="text-slate-600 mb-2"/>
					<p class="text-slate-400">
						{props.emptyMessage ?? 'No rooms found'}
					</p>
				</div>
			</Show>

			{/* Room list */}
			<Show when={!props.loading && props.rooms.length > 0}>
				<div class={containerClass()}>
					<For each={props.rooms}>
						{(room) => (
							<Show
								when={viewMode() !== 'compact'}
								fallback={
									<RoomCardCompact
										id={room.id}
										name={room.name}
										ownerName={room.ownerName}
										userCount={room.userCount}
										maxUserCount={room.maxUserCount}
										isFavourite={room.isFavourite}
										isGroupRoom={room.isGroupRoom}
										doorMode={room.doorMode}
										onClick={props.onRoomClick}
										onFavouriteClick={props.onFavouriteClick}
									/>
								}
							>
								<RoomCard
									id={room.id}
									name={room.name}
									ownerName={room.ownerName}
									description={room.description}
									userCount={room.userCount}
									maxUserCount={room.maxUserCount}
									thumbnail={room.thumbnail}
									tags={room.tags}
									isFavourite={room.isFavourite}
									isGroupRoom={room.isGroupRoom}
									isStaffPick={room.isStaffPick}
									doorMode={room.doorMode}
									score={room.score}
									categoryId={room.categoryId}
									onClick={props.onRoomClick}
									onFavouriteClick={props.onFavouriteClick}
									onInfoClick={props.onInfoClick}
								/>
							</Show>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
}
