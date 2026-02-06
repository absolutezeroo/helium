import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import clsx from 'clsx';
import {BadgeItem} from './BadgeItem';

export interface IBadgeData
{
	badgeId: string;
	name?: string;
	description?: string;
	isActive: boolean;
	isSelected?: boolean;
	isUnseen?: boolean;
}

export interface IBadgesViewProps
{
	badges: IBadgeData[];
	activeBadges: IBadgeData[];
	selectedBadge: IBadgeData | null;
	loading?: boolean;
	onBadgeSelect?: (badgeId: string) => void;
	onBadgeToggle?: (badgeId: string) => void;
}

export function BadgesView(props: IBadgesViewProps): JSX.Element
{
	return (
		<div class="flex flex-col h-full">
			{/* Active badges section */}
			<div class="p-3 border-b border-slate-700/50 bg-slate-800/30">
				<h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
					Active Badges ({props.activeBadges.length}/5)
				</h4>
				<div class="grid grid-cols-5 gap-2">
					<For each={[0, 1, 2, 3, 4]}>
						{(slot) =>
						{
							const badge = () => props.activeBadges[slot];
							return (
								<div
									class={clsx(
										'aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors',
										badge()
											? 'border-green-400/50 bg-green-500/10 hover:bg-green-500/20'
											: 'border-slate-600 bg-slate-700/30 hover:bg-slate-700/50'
									)}
									onClick={() => badge() && props.onBadgeSelect?.(badge()!.badgeId)}
									onDblClick={() => badge() && props.onBadgeToggle?.(badge()!.badgeId)}
								>
									<Show when={badge()}>
										<div
											class="text-[10px] text-slate-300 font-medium text-center px-1 truncate w-full">
											{badge()!.badgeId.substring(0, 6)}
										</div>
									</Show>
								</div>
							);
						}}
					</For>
				</div>
			</div>

			{/* All badges grid */}
			<div class="flex-1 overflow-y-auto p-3">
				<Show
					when={!props.loading}
					fallback={
						<div class="flex items-center justify-center h-32">
							<div
								class="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full"/>
						</div>
					}
				>
					<Show
						when={props.badges.length > 0}
						fallback={
							<div class="flex flex-col items-center justify-center h-32 text-slate-500">
								<svg class="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
										  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
								</svg>
								<span class="text-sm">No badges</span>
							</div>
						}
					>
						<div class="grid grid-cols-6 gap-2">
							<For each={props.badges}>
								{(badge) => (
									<BadgeItem
										badgeId={badge.badgeId}
										name={badge.name}
										isSelected={props.selectedBadge?.badgeId === badge.badgeId}
										isActive={badge.isActive}
										isUnseen={badge.isUnseen}
										onClick={() => props.onBadgeSelect?.(badge.badgeId)}
										onDoubleClick={() => props.onBadgeToggle?.(badge.badgeId)}
									/>
								)}
							</For>
						</div>
					</Show>
				</Show>
			</div>

			{/* Selected badge details */}
			<Show when={props.selectedBadge}>
				<div class="p-3 border-t border-slate-700/50 bg-slate-800/30">
					<div class="flex items-center justify-between">
						<div>
							<h4 class="text-sm font-semibold text-white">
								{props.selectedBadge?.name ?? props.selectedBadge?.badgeId}
							</h4>
							<Show when={props.selectedBadge?.description}>
								<p class="text-xs text-slate-400">{props.selectedBadge?.description}</p>
							</Show>
						</div>
						<button
							type="button"
							class={clsx(
								'py-1.5 px-3 rounded-lg text-sm font-medium',
								'transition-colors',
								props.selectedBadge?.isActive
									? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
									: 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
							)}
							onClick={() => props.onBadgeToggle?.(props.selectedBadge!.badgeId)}
						>
							{props.selectedBadge?.isActive ? 'Remove' : 'Wear'}
						</button>
					</div>
				</div>
			</Show>
		</div>
	);
}
