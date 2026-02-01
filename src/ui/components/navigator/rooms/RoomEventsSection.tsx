import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import clsx from 'clsx';
import {NavigatorIcon, Skeleton} from '../common';
import {useNavigatorLocalization} from '../hooks';

export interface RoomEvent
{
	id: number;
	roomId: number;
	roomName: string;
	ownerName: string;
	eventName: string;
	eventDescription?: string;
	userCount: number;
	maxUserCount: number;
	timeStarted?: number;
	eventCategory?: number;
}

export interface RoomEventsSectionProps
{
	events: RoomEvent[];
	loading?: boolean;
	expanded?: boolean;
	onEventClick?: (roomId: number) => void;
	onToggleExpand?: () => void;
	class?: string;
}

/**
 * Room events section - displays active room events/promotions
 */
export function RoomEventsSection(props: RoomEventsSectionProps): JSX.Element
{
	const {t, keys} = useNavigatorLocalization();

	const formatTime = (timestamp?: number): string =>
	{
		if (!timestamp) return '';
		const minutes = Math.floor((Date.now() - timestamp) / 60000);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		return `${hours}h ago`;
	};

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
					<NavigatorIcon name="calendar" size="sm" class="text-purple-400"/>
					<span class="text-sm font-medium text-slate-300">{t(keys.ROOM_EVENTS_TITLE)}</span>
					<Show when={props.events.length > 0}>
						<span class="text-xs text-slate-500">({props.events.length})</span>
					</Show>
				</div>
			</button>

			{/* Content */}
			<Show when={props.expanded}>
				<div class="px-2 pb-2">
					{/* Loading */}
					<Show when={props.loading}>
						<div class="space-y-2">
							<EventSkeleton/>
							<EventSkeleton/>
						</div>
					</Show>

					{/* Empty state */}
					<Show when={!props.loading && props.events.length === 0}>
						<div class="text-center py-4 px-2">
							<p class="text-sm text-slate-500">{t(keys.ROOM_EVENTS_EMPTY)}</p>
						</div>
					</Show>

					{/* Events list */}
					<Show when={!props.loading && props.events.length > 0}>
						<div class="space-y-2">
							<For each={props.events}>
								{(event) => (
									<div
										class={clsx(
											'p-3 rounded-lg cursor-pointer transition-all',
											'bg-gradient-to-r from-purple-500/10 to-slate-800/50',
											'border border-purple-500/20 hover:border-purple-500/40',
											'hover:from-purple-500/15'
										)}
										onClick={() => props.onEventClick?.(event.roomId)}
									>
										{/* Event name */}
										<div class="flex items-start justify-between gap-2">
											<h4 class="text-sm font-medium text-slate-200 truncate">
												{event.eventName}
											</h4>
											<Show when={event.timeStarted}>
												<span class="text-xs text-slate-500 flex-shrink-0">
													{formatTime(event.timeStarted)}
												</span>
											</Show>
										</div>

										{/* Event description */}
										<Show when={event.eventDescription}>
											<p class="text-xs text-slate-400 mt-1 line-clamp-2">
												{event.eventDescription}
											</p>
										</Show>

										{/* Room info */}
										<div
											class="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
											<div class="flex items-center gap-1.5 text-xs text-slate-400">
												<NavigatorIcon name="room" size="xs"/>
												<span class="truncate max-w-[120px]">{event.roomName}</span>
											</div>
											<div class="flex items-center gap-1.5 text-xs text-green-400">
												<NavigatorIcon name="users" size="xs"/>
												<span>{event.userCount}/{event.maxUserCount}</span>
											</div>
										</div>
									</div>
								)}
							</For>
						</div>
					</Show>
				</div>
			</Show>
		</div>
	);
}

/**
 * Event skeleton for loading state
 */
function EventSkeleton(): JSX.Element
{
	return (
		<div class="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
			<Skeleton height={16} width="60%" rounded="sm"/>
			<Skeleton height={12} width="90%" rounded="sm" class="mt-2"/>
			<div class="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50">
				<Skeleton height={12} width={80} rounded="sm"/>
				<Skeleton height={12} width={50} rounded="sm"/>
			</div>
		</div>
	);
}
