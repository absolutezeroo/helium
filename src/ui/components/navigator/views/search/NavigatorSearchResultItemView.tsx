import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';
import type {IconName} from '../../common';
import {NavigatorIcon, UserCountBar} from '../../common';

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

export type RoomListViewMode = 'cards' | 'compact' | 'grid';

interface ItemProps
{
	room: RoomListRoom;
	onClick?: (roomId: number) => void;
	onFavouriteClick?: (roomId: number) => void;
	onInfoClick?: (roomId: number) => void;
}

function getDoorIcon(doorMode?: string): IconName
{
	switch (doorMode)
	{
		case 'doorbell':
			return 'doorbell';
		case 'password':
			return 'lock';
		case 'invisible':
			return 'hidden';
		default:
			return 'door';
	}
}

/**
 * Card view - shows thumbnail, description, tags, score
 */
export function NavigatorSearchResultItemView(props: ItemProps): JSX.Element
{
	const room = () => props.room;

	const handleClick = () => props.onClick?.(room().id);

	const handleFavouriteClick = (e: MouseEvent) =>
	{
		e.stopPropagation();
		props.onFavouriteClick?.(room().id);
	};

	const handleInfoClick = (e: MouseEvent) =>
	{
		e.stopPropagation();
		props.onInfoClick?.(room().id);
	};

	return (
		<div
			class="group relative flex gap-3 p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-lg cursor-pointer transition-all duration-150"
			onClick={handleClick}
		>
			{/* Thumbnail */}
			<div class="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-slate-700">
				<Show
					when={room().thumbnail}
					fallback={
						<div class="w-full h-full flex items-center justify-center">
							<NavigatorIcon name="room" size="lg" class="text-slate-500"/>
						</div>
					}
				>
					<img src={room().thumbnail} alt={room().name} class="w-full h-full object-cover"/>
				</Show>
			</div>

			{/* Content */}
			<div class="flex-1 min-w-0">
				<div class="flex items-start justify-between gap-2">
					<div class="flex items-center gap-1.5 min-w-0">
						<h3 class="text-sm font-medium text-slate-200 truncate">{room().name}</h3>
						<Show when={room().isStaffPick}>
							<NavigatorIcon name="star" size="xs" class="text-yellow-400 flex-shrink-0"/>
						</Show>
						<Show when={room().isGroupRoom}>
							<NavigatorIcon name="group" size="xs" class="text-blue-400 flex-shrink-0"/>
						</Show>
					</div>
					<NavigatorIcon name={getDoorIcon(room().doorMode)} size="xs" class="text-slate-400 flex-shrink-0"/>
				</div>

				<p class="text-xs text-slate-400 truncate">
					<NavigatorIcon name="user" size="xs" class="inline mr-1"/>
					{room().ownerName}
				</p>

				<Show when={room().description}>
					<p class="mt-1 text-xs text-slate-500 line-clamp-2">{room().description}</p>
				</Show>

				<div class="mt-2 flex flex-col gap-2">
					<UserCountBar userCount={room().userCount} maxUserCount={room().maxUserCount} size="sm" showLabel/>

					<div class="flex items-center justify-between">
						<Show when={room().score !== undefined && room().score! > 0}>
							<div class="flex items-center gap-1 text-xs text-slate-400">
								<NavigatorIcon name="thumbUp" size="xs"/>
								<span>{room().score}</span>
							</div>
						</Show>
						<Show when={room().tags && room().tags!.length > 0}>
							<div class="flex items-center gap-1">
								{room().tags!.slice(0, 2).map((tag) => (
									<span class="px-1.5 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">{tag}</span>
								))}
							</div>
						</Show>
					</div>
				</div>
			</div>

			{/* Hover actions */}
			<div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<button
					type="button"
					class={clsx(
						'p-1 rounded hover:bg-slate-600/50 transition-colors',
						room().isFavourite ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-slate-200'
					)}
					onClick={handleFavouriteClick}
				>
					<NavigatorIcon name={room().isFavourite ? 'heartFilled' : 'heart'} size="sm"/>
				</button>
				<button
					type="button"
					class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-600/50 transition-colors"
					onClick={handleInfoClick}
				>
					<NavigatorIcon name="info" size="sm"/>
				</button>
			</div>
		</div>
	);
}

/**
 * Compact view - single row, minimal info
 */
export function NavigatorSearchResultItemCompactView(props: ItemProps): JSX.Element
{
	const room = () => props.room;

	const handleClick = () => props.onClick?.(room().id);

	const handleFavouriteClick = (e: MouseEvent) =>
	{
		e.stopPropagation();
		props.onFavouriteClick?.(room().id);
	};

	const getOccupancyColor = () =>
	{
		const ratio = room().userCount / room().maxUserCount;
		if (ratio >= 1) return 'text-red-400';
		if (ratio >= 0.75) return 'text-orange-400';
		if (ratio >= 0.5) return 'text-yellow-400';
		return 'text-green-400';
	};

	return (
		<div
			class="group flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700/40 border-b border-slate-700/30 last:border-b-0 cursor-pointer transition-all duration-150"
			onClick={handleClick}
		>
			<NavigatorIcon name={getDoorIcon(room().doorMode)} size="sm" class="text-slate-400 flex-shrink-0"/>

			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-1">
					<span class="text-sm text-slate-200 truncate">{room().name}</span>
					<Show when={room().isGroupRoom}>
						<NavigatorIcon name="group" size="xs" class="text-blue-400 flex-shrink-0"/>
					</Show>
				</div>
				<span class="text-xs text-slate-500 truncate block">{room().ownerName}</span>
			</div>

			<div class={clsx('flex items-center gap-1 text-xs flex-shrink-0', getOccupancyColor())}>
				<NavigatorIcon name="users" size="xs"/>
				<span>{room().userCount}</span>
			</div>

			<button
				type="button"
				class={clsx(
					'p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-600/50 transition-all',
					room().isFavourite ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-slate-200'
				)}
				onClick={handleFavouriteClick}
			>
				<NavigatorIcon name={room().isFavourite ? 'heartFilled' : 'heart'} size="sm"/>
			</button>
		</div>
	);
}
