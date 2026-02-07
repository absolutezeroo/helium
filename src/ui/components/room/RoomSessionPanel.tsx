import {Component, Show} from 'solid-js';
import clsx from 'clsx';
import {ModuleId, useModule} from '../../bridge';

/**
 * RoomSessionPanel
 *
 * Displays session information about the current room:
 * - Room name and description
 * - Owner information
 * - Room rating
 * - Session status and permissions
 */
export const RoomSessionPanel: Component = () =>
{
	const {state} = useModule(ModuleId.Room);

	return (
		<Show when={state().currentRoom !== null}>
			<div class="glass rounded-[var(--radius-lg)] p-4">
				{/* Room header */}
				<div class="flex items-center gap-2 mb-3">
					<h2 class="text-base font-semibold text-text-primary m-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
						{state().currentRoom?.roomName ?? 'Unknown Room'}
					</h2>
					<Show when={state().isStaffPick}>
						<span
							class="bg-gradient-to-br from-accent to-purple-500 text-white text-[0.625rem] font-semibold px-2 py-0.5 rounded-full uppercase">
							Staff Pick
						</span>
					</Show>
				</div>

				{/* Room description */}
				<Show when={state().currentRoom?.description}>
					<p class="text-xs text-text-secondary mb-3 leading-relaxed">
						{state().currentRoom?.description}
					</p>
				</Show>

				{/* Info rows */}
				<InfoRow label="Owner" value={state().currentRoom?.ownerName ?? 'Unknown'}/>
				<InfoRow label="Rating" value={`${state().rating}${state().canRate ? ' (Can rate)' : ''}`}/>
				<InfoRow label="Users"
						 value={`${Object.keys(state().users).length} / ${state().currentRoom?.maxUserCount ?? '?'}`}/>

				{/* Session state */}
				<div class="flex justify-between items-center text-xs py-1.5">
					<span class="text-text-muted">Session:</span>
					<span class={clsx(
						'font-medium',
						state().sessionState === 'created' && 'text-warning',
						state().sessionState === 'started' && 'text-success',
						state().sessionState === 'ended' && 'text-text-muted'
					)}>
						{state().sessionState}
					</span>
				</div>

				{/* Permissions */}
				<div class="flex gap-2 mt-3 flex-wrap">
					<Show when={state().isRoomOwner}>
						<span
							class="text-[0.625rem] font-semibold px-2 py-1 rounded-[var(--radius-sm)] uppercase bg-credits/15 text-credits border border-credits/25">
							Owner
						</span>
					</Show>
					<Show when={state().roomControllerLevel >= 4}>
						<span
							class="text-[0.625rem] font-semibold px-2 py-1 rounded-[var(--radius-sm)] uppercase bg-error/15 text-error border border-error/25">
							Admin
						</span>
					</Show>
					<Show when={state().roomControllerLevel >= 1 && state().roomControllerLevel < 4}>
						<span
							class="text-[0.625rem] font-semibold px-2 py-1 rounded-[var(--radius-sm)] uppercase bg-success/15 text-success border border-success/25">
							Rights
						</span>
					</Show>
				</div>

				{/* Room event */}
				<Show when={state().roomEvent}>
					<div class="mt-3 p-3 bg-surface-hover rounded-[var(--radius-md)]">
						<h4 class="text-[0.625rem] font-semibold uppercase text-accent mb-1.5">Room Event</h4>
						<p class="text-sm font-medium text-text-primary mb-1">{state().roomEvent?.eventName}</p>
						<p class="text-xs text-text-secondary">{state().roomEvent?.eventDescription}</p>
					</div>
				</Show>
			</div>
		</Show>
	);
};

function InfoRow(props: { label: string; value: string })
{
	return (
		<div class="flex justify-between items-center text-xs py-1.5 border-b border-border last:border-b-0">
			<span class="text-text-muted">{props.label}:</span>
			<span class="text-text-primary font-medium">{props.value}</span>
		</div>
	);
}
