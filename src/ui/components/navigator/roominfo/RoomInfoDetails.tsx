import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import {NavigatorIcon} from '../common';

export interface IRoomInfoDetailsProps
{
	description?: string;
	userCount: number;
	maxUserCount: number;
	score?: number;
	categoryName?: string;
	tags?: string[];
	tradeMode?: number;
	allowPets?: boolean;
	allowPetsEating?: boolean;
	onTagClick?: (tag: string) => void;
	class?: string;
}

/**
 * Room info details - displays room description, stats, and tags
 */
export function RoomInfoDetails(props: IRoomInfoDetailsProps): JSX.Element
{
	const getOccupancyColor = () =>
	{
		const ratio = props.userCount / props.maxUserCount;
		if (ratio >= 1) return 'text-red-400';
		if (ratio >= 0.75) return 'text-orange-400';
		if (ratio >= 0.5) return 'text-yellow-400';
		return 'text-green-400';
	};

	const getTradeModeText = () =>
	{
		switch (props.tradeMode)
		{
			case 0:
				return 'Not allowed';
			case 1:
				return 'Allowed';
			case 2:
				return 'Room owner only';
			default:
				return 'Unknown';
		}
	};

	return (
		<div class={`space-y-4 ${props.class ?? ''}`}>
			{/* Description */}
			<Show when={props.description}>
				<div>
					<h3 class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
						Description
					</h3>
					<p class="text-sm text-slate-300 whitespace-pre-wrap">
						{props.description}
					</p>
				</div>
			</Show>

			{/* Stats */}
			<div class="grid grid-cols-2 gap-3">
				{/* Users */}
				<div class="bg-slate-800/50 rounded-lg p-3">
					<div class="flex items-center gap-2">
						<NavigatorIcon name="users" size="sm" class={getOccupancyColor()}/>
						<div>
							<div class={`text-lg font-semibold ${getOccupancyColor()}`}>
								{props.userCount}/{props.maxUserCount}
							</div>
							<div class="text-xs text-slate-500">Users</div>
						</div>
					</div>
				</div>

				{/* Score */}
				<Show when={props.score !== undefined}>
					<div class="bg-slate-800/50 rounded-lg p-3">
						<div class="flex items-center gap-2">
							<NavigatorIcon name="thumbUp" size="sm" class="text-blue-400"/>
							<div>
								<div class="text-lg font-semibold text-slate-200">
									{props.score}
								</div>
								<div class="text-xs text-slate-500">Score</div>
							</div>
						</div>
					</div>
				</Show>
			</div>

			{/* ICategory */}
			<Show when={props.categoryName}>
				<div class="flex items-center gap-2 text-sm">
					<span class="text-slate-400">Category:</span>
					<span class="text-slate-200">{props.categoryName}</span>
				</div>
			</Show>

			{/* Trade mode */}
			<Show when={props.tradeMode !== undefined}>
				<div class="flex items-center gap-2 text-sm">
					<NavigatorIcon name="trade" size="sm" class="text-slate-400"/>
					<span class="text-slate-400">Trading:</span>
					<span class="text-slate-200">{getTradeModeText()}</span>
				</div>
			</Show>

			{/* Pets */}
			<Show when={props.allowPets !== undefined}>
				<div class="flex items-center gap-4 text-sm">
					<div class="flex items-center gap-2">
						<NavigatorIcon
							name="pet"
							size="sm"
							class={props.allowPets ? 'text-green-400' : 'text-slate-500'}
						/>
						<span class={props.allowPets ? 'text-slate-200' : 'text-slate-500'}>
                            Pets {props.allowPets ? 'allowed' : 'not allowed'}
                        </span>
					</div>
					<Show when={props.allowPets && props.allowPetsEating}>
						<span class="text-xs text-slate-400">(eating allowed)</span>
					</Show>
				</div>
			</Show>

			{/* Tags */}
			<Show when={props.tags && props.tags.length > 0}>
				<div>
					<h3 class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
						Tags
					</h3>
					<div class="flex flex-wrap gap-2">
						<For each={props.tags}>
							{(tag) => (
								<button
									type="button"
									class={`
                                        px-2 py-1 text-xs
                                        bg-slate-700 hover:bg-slate-600
                                        text-slate-300 hover:text-slate-100
                                        rounded-full
                                        transition-colors
                                        ${props.onTagClick ? 'cursor-pointer' : 'cursor-default'}
                                    `}
									onClick={() => props.onTagClick?.(tag)}
									disabled={!props.onTagClick}
								>
									#{tag}
								</button>
							)}
						</For>
					</div>
				</div>
			</Show>
		</div>
	);
}
