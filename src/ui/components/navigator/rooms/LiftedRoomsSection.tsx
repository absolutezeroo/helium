import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import clsx from 'clsx';
import {NavigatorIcon, RoomCardCompactSkeleton} from '../common';
import {RoomCardCompact} from './RoomCardCompact';
import {useNavigatorLocalization} from '../hooks';

export interface ILiftedRoom
{
	id: number;
	name: string;
	ownerName: string;
	userCount: number;
	maxUserCount: number;
	image?: string;
	description?: string;
}

export interface ILiftedRoomsSectionProps
{
	rooms: ILiftedRoom[];
	loading?: boolean;
	expanded?: boolean;
	onRoomClick?: (roomId: number) => void;
	onToggleExpand?: () => void;
	class?: string;
}

/**
 * Lifted/Promoted rooms section - displays rooms that have been promoted
 */
export function LiftedRoomsSection(props: ILiftedRoomsSectionProps): JSX.Element
{
	const {t, keys} = useNavigatorLocalization();

	return (
		<div class={clsx('border-b border-slate-700/50', props.class)}>
			{/* Header */}
			<button
				type="button"
				class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/30 transition-colors"
				onClick={props.onToggleExpand}
			>
				<div class="flex items-center gap-2">
					<NavigatorIcon
						name={props.expanded ? 'chevronDown' : 'chevronRight'}
						size="sm"
						class="text-slate-400"
					/>
					<NavigatorIcon name="star" size="sm" class="text-yellow-400"/>
					<span class="text-sm font-medium text-slate-300">{t(keys.LIFTED_ROOMS_TITLE)}</span>
					<Show when={props.rooms.length > 0}>
						<span class="text-xs text-slate-500">({props.rooms.length})</span>
					</Show>
				</div>
			</button>

			{/* Content */}
			<Show when={props.expanded}>
				<div class="px-2 pb-2">
					{/* Loading */}
					<Show when={props.loading}>
						<div class="space-y-1">
							<RoomCardCompactSkeleton/>
							<RoomCardCompactSkeleton/>
						</div>
					</Show>

					{/* Empty state */}
					<Show when={!props.loading && props.rooms.length === 0}>
						<div class="text-center py-4 px-2">
							<p class="text-sm text-slate-500">{t(keys.LIFTED_ROOMS_EMPTY)}</p>
						</div>
					</Show>

					{/* Rooms list */}
					<Show when={!props.loading && props.rooms.length > 0}>
						<div class="space-y-1">
							<For each={props.rooms}>
								{(room) => (
									<RoomCardCompact
										id={room.id}
										name={room.name}
										ownerName={room.ownerName}
										userCount={room.userCount}
										maxUserCount={room.maxUserCount}
										onClick={props.onRoomClick}
										class="bg-gradient-to-r from-yellow-500/5 to-transparent"
									/>
								)}
							</For>
						</div>
					</Show>
				</div>
			</Show>
		</div>
	);
}
