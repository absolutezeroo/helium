import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import type {IconName} from '../common';
import {NavigatorIcon, UserCountBar} from '../common';

export interface RoomCardProps
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
	tradeMode?: number;
	score?: number;
	categoryId?: number;
	onClick?: (roomId: number) => void;
	onFavouriteClick?: (roomId: number) => void;
	onInfoClick?: (roomId: number) => void;
	class?: string;
}

/**
 * Room card component - displays room information in a card format
 */
export function RoomCard(props: RoomCardProps): JSX.Element
{
	const handleClick = () =>
	{
		props.onClick?.(props.id);
	};

	const handleFavouriteClick = (e: MouseEvent) =>
	{
		e.stopPropagation();
		props.onFavouriteClick?.(props.id);
	};

	const handleInfoClick = (e: MouseEvent) =>
	{
		e.stopPropagation();
		props.onInfoClick?.(props.id);
	};

	const getDoorIcon = (): IconName =>
	{
		switch (props.doorMode)
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
	};

	return (
		<div
			class={`
                group relative
                flex gap-3 p-3
                bg-slate-800/50 hover:bg-slate-700/50
                border border-slate-700 hover:border-slate-600
                rounded-lg cursor-pointer
                transition-all duration-150
                ${props.class ?? ''}
            `}
			onClick={handleClick}
		>
			{/* Thumbnail */}
			<div class="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-slate-700">
				<Show
					when={props.thumbnail}
					fallback={
						<div class="w-full h-full flex items-center justify-center">
							<NavigatorIcon name="room" size="lg" class="text-slate-500"/>
						</div>
					}
				>
					<img
						src={props.thumbnail}
						alt={props.name}
						class="w-full h-full object-cover"
					/>
				</Show>
			</div>

			{/* Content */}
			<div class="flex-1 min-w-0">
				{/* Header */}
				<div class="flex items-start justify-between gap-2">
					<div class="flex items-center gap-1.5 min-w-0">
						<h3 class="text-sm font-medium text-slate-200 truncate">
							{props.name}
						</h3>
						<Show when={props.isStaffPick}>
							<NavigatorIcon name="star" size="xs" class="text-yellow-400 flex-shrink-0"/>
						</Show>
						<Show when={props.isGroupRoom}>
							<NavigatorIcon name="group" size="xs" class="text-blue-400 flex-shrink-0"/>
						</Show>
					</div>
					<div class="flex items-center gap-1 flex-shrink-0">
						<NavigatorIcon name={getDoorIcon()} size="xs" class="text-slate-400"/>
					</div>
				</div>

				{/* Owner */}
				<p class="text-xs text-slate-400 truncate">
					<NavigatorIcon name="user" size="xs" class="inline mr-1"/>
					{props.ownerName}
				</p>

				{/* Description */}
				<Show when={props.description}>
					<p class="mt-1 text-xs text-slate-500 line-clamp-2">
						{props.description}
					</p>
				</Show>

				{/* Footer */}
				<div class="mt-2 flex flex-col gap-2">
					{/* User count progress bar */}
					<UserCountBar
						userCount={props.userCount}
						maxUserCount={props.maxUserCount}
						size="sm"
						showLabel
					/>

					{/* Bottom row: Score and Tags */}
					<div class="flex items-center justify-between">
						{/* Score */}
						<Show when={props.score !== undefined && props.score > 0}>
							<div class="flex items-center gap-1 text-xs text-slate-400">
								<NavigatorIcon name="thumbUp" size="xs"/>
								<span>{props.score}</span>
							</div>
						</Show>

						{/* Tags */}
						<Show when={props.tags && props.tags.length > 0}>
							<div class="flex items-center gap-1">
								{props.tags!.slice(0, 2).map((tag) => (
									<span class="px-1.5 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">
										{tag}
									</span>
								))}
							</div>
						</Show>
					</div>
				</div>
			</div>

			{/* Action buttons (shown on hover) */}
			<div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<button
					type="button"
					class={`
                        p-1 rounded
                        ${props.isFavourite
						? 'text-red-400 hover:text-red-300'
						: 'text-slate-400 hover:text-slate-200'
					}
                        hover:bg-slate-600/50
                        transition-colors
                    `}
					onClick={handleFavouriteClick}
					title={props.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
				>
					<NavigatorIcon name={props.isFavourite ? 'heartFilled' : 'heart'} size="sm"/>
				</button>
				<button
					type="button"
					class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-600/50 transition-colors"
					onClick={handleInfoClick}
					title="Room info"
				>
					<NavigatorIcon name="info" size="sm"/>
				</button>
			</div>
		</div>
	);
}
