import type {JSX} from 'solid-js';
import {createSignal, For, Show} from 'solid-js';
import clsx from 'clsx';
import {NavigatorIcon} from '../common';
import {RoomCard} from './RoomCard';
import {RoomCardCompact} from './RoomCardCompact';
import type {RoomListRoom, RoomListViewMode} from './RoomList';

export interface NavigatorBlockData
{
	searchCode: string;
	text: string;
	actionAllowed: number;
	forceClosed: boolean;
	viewMode: number;
	rooms: RoomListRoom[];
}

export interface NavigatorBlockSectionProps
{
	block: NavigatorBlockData;
	displayMode?: RoomListViewMode;
	onRoomClick?: (roomId: number) => void;
	onFavouriteClick?: (roomId: number) => void;
	onInfoClick?: (roomId: number) => void;
}

/**
 * A collapsible section for a navigator search result block.
 * Matches the Habbo layout where each category (e.g., "Official", "Room bundles")
 * is a collapsible section containing its rooms.
 */
export function NavigatorBlockSection(props: NavigatorBlockSectionProps): JSX.Element
{
	const [isExpanded, setIsExpanded] = createSignal(!props.block.forceClosed);

	const displayMode = () => props.displayMode ?? 'compact';

	const title = () => props.block.text || props.block.searchCode;

	const containerClass = () =>
	{
		switch (displayMode())
		{
			case 'grid':
				return 'grid grid-cols-2 gap-2 p-3';
			case 'compact':
				return 'flex flex-col';
			default:
				return 'flex flex-col gap-2 p-3';
		}
	};

	return (
		<div class="border-b border-slate-700/50 last:border-b-0">
			{/* Block header - collapsible */}
			<button
				type="button"
				class={clsx(
					'w-full flex items-center justify-between',
					'px-4 py-2.5',
					'bg-slate-800/60 hover:bg-slate-700/60',
					'transition-colors duration-150',
					'select-none cursor-pointer'
				)}
				onClick={() => setIsExpanded(!isExpanded())}
			>
				<div class="flex items-center gap-2 min-w-0">
					<NavigatorIcon name="room" size="sm" class="text-slate-400 flex-shrink-0"/>
					<span class="text-sm font-medium text-slate-200 truncate">
						{title()}
					</span>
					<Show when={props.block.rooms.length > 0}>
						<span class="text-xs text-slate-500">
							({props.block.rooms.length})
						</span>
					</Show>
				</div>
				<NavigatorIcon
					name={isExpanded() ? 'chevronDown' : 'chevronRight'}
					size="sm"
					class="text-slate-400 flex-shrink-0"
				/>
			</button>

			{/* Block content - rooms */}
			<Show when={isExpanded() && props.block.rooms.length > 0}>
				<div class={containerClass()}>
					<For each={props.block.rooms}>
						{(room) => (
							<Show
								when={displayMode() !== 'compact'}
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

			{/* Empty block when expanded */}
			<Show when={isExpanded() && props.block.rooms.length === 0}>
				<div class="px-4 py-3 text-xs text-slate-500 text-center">
					No rooms
				</div>
			</Show>
		</div>
	);
}
