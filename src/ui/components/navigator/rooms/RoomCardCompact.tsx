import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import type {IconName} from '../common';
import {NavigatorIcon} from '../common';

export interface RoomCardCompactProps
{
	id: number;
	name: string;
	ownerName: string;
	userCount: number;
	maxUserCount: number;
	isFavourite?: boolean;
	isGroupRoom?: boolean;
	doorMode?: 'open' | 'doorbell' | 'password' | 'invisible';
	onClick?: (roomId: number) => void;
	onFavouriteClick?: (roomId: number) => void;
	class?: string;
}

/**
 * Compact room card - minimal display for lists
 */
export function RoomCardCompact(props: RoomCardCompactProps): JSX.Element
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

	const getOccupancyColor = () =>
	{
		const ratio = props.userCount / props.maxUserCount;
		if (ratio >= 1) return 'text-red-400';
		if (ratio >= 0.75) return 'text-orange-400';
		if (ratio >= 0.5) return 'text-yellow-400';
		return 'text-green-400';
	};

	return (
		<div
			class={`
                group flex items-center gap-2 px-3 py-2
                hover:bg-slate-700/50
                border-b border-slate-700/50 last:border-b-0
                cursor-pointer
                transition-colors duration-100
                ${props.class ?? ''}
            `}
			onClick={handleClick}
		>
			{/* Door status */}
			<NavigatorIcon name={getDoorIcon()} size="sm" class="text-slate-400 flex-shrink-0"/>

			{/* Room name */}
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-1">
					<span class="text-sm text-slate-200 truncate">{props.name}</span>
					<Show when={props.isGroupRoom}>
						<NavigatorIcon name="group" size="xs" class="text-blue-400 flex-shrink-0"/>
					</Show>
				</div>
				<span class="text-xs text-slate-500 truncate block">{props.ownerName}</span>
			</div>

			{/* User count */}
			<div class={`flex items-center gap-1 text-xs ${getOccupancyColor()} flex-shrink-0`}>
				<NavigatorIcon name="users" size="xs"/>
				<span>{props.userCount}</span>
			</div>

			{/* Favourite button */}
			<button
				type="button"
				class={`
                    p-1 rounded
                    opacity-0 group-hover:opacity-100
                    ${props.isFavourite
					? 'text-red-400 hover:text-red-300'
					: 'text-slate-400 hover:text-slate-200'
				}
                    hover:bg-slate-600/50
                    transition-all
                `}
				onClick={handleFavouriteClick}
				title={props.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
			>
				<NavigatorIcon name={props.isFavourite ? 'heartFilled' : 'heart'} size="sm"/>
			</button>
		</div>
	);
}
