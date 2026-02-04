import {Component, Show} from 'solid-js';
import {useModule, ModuleId} from '../../bridge';

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

	// Use state() signal directly for reactivity
	return (
		<Show when={state().currentRoom !== null}>
			<div class="room-session-panel">
				{/* Room header */}
				<div class="room-session-header">
					<h2 class="room-name">{state().currentRoom?.roomName ?? 'Unknown Room'}</h2>
					<Show when={state().isStaffPick}>
						<span class="staff-pick-badge">Staff Pick</span>
					</Show>
				</div>

				{/* Room description */}
				<Show when={state().currentRoom?.description}>
					<p class="room-description">{state().currentRoom?.description}</p>
				</Show>

				{/* Room owner */}
				<div class="room-owner">
					<span class="label">Owner:</span>
					<span class="value">{state().currentRoom?.ownerName ?? 'Unknown'}</span>
				</div>

				{/* Room rating */}
				<div class="room-rating">
					<span class="label">Rating:</span>
					<span class="value">
						{state().rating} {state().canRate ? '(Can rate)' : ''}
					</span>
				</div>

				{/* User count */}
				<div class="room-users-count">
					<span class="label">Users:</span>
					<span class="value">
						{Object.keys(state().users).length} / {state().currentRoom?.maxUserCount ?? '?'}
					</span>
				</div>

				{/* Session state */}
				<div class="room-session-state">
					<span class="label">Session:</span>
					<span class={`value state-${state().sessionState}`}>
						{state().sessionState}
					</span>
				</div>

				{/* Permissions */}
				<div class="room-permissions">
					<Show when={state().isRoomOwner}>
						<span class="permission-badge owner">Owner</span>
					</Show>
					<Show when={state().roomControllerLevel >= 4}>
						<span class="permission-badge admin">Admin</span>
					</Show>
					<Show when={state().roomControllerLevel >= 1 && state().roomControllerLevel < 4}>
						<span class="permission-badge rights">Rights</span>
					</Show>
				</div>

				{/* Room event */}
				<Show when={state().roomEvent}>
					<div class="room-event">
						<h4>Room Event</h4>
						<p class="event-name">{state().roomEvent?.eventName}</p>
						<p class="event-description">{state().roomEvent?.eventDescription}</p>
					</div>
				</Show>
			</div>
		</Show>
	);
};
