import {Component, For, Show, createMemo} from 'solid-js';
import {useModule, ModuleId} from '../../bridge';
import {RoomUserType} from '@/modules';
import type {RoomUserData} from '@/modules';

/**
 * RoomUserList
 *
 * Displays the list of users currently in the room.
 * Shows users, pets, and bots separately.
 */
export const RoomUserList: Component = () =>
{
	const {state} = useModule(ModuleId.Room);

	// Separate users by type
	const humanUsers = createMemo(() =>
		Object.values(state().users).filter(u => u.type === RoomUserType.USER)
	);

	const pets = createMemo(() =>
		Object.values(state().users).filter(u => u.type === RoomUserType.PET)
	);

	const bots = createMemo(() =>
		Object.values(state().users).filter(
			u => u.type === RoomUserType.BOT || u.type === RoomUserType.RENTABLE_BOT
		)
	);

	const ownUser = createMemo(() =>
	{
		if (state().ownUserRoomIndex < 0) return null;
		return state().users[state().ownUserRoomIndex] ?? null;
	});

	// Use state() signal directly for reactivity
	return (
		<Show when={state().currentRoom !== null}>
			<div class="room-user-list">
				<div class="room-user-list-header">
					<h3>Room Users ({Object.keys(state().users).length})</h3>
					<Show when={state().isRoomOwner}>
						<span class="owner-badge">Owner</span>
					</Show>
					<Show when={!state().isRoomOwner && state().roomControllerLevel > 0}>
						<span class="rights-badge">Rights</span>
					</Show>
				</div>

				{/* Own user */}
				<Show when={ownUser()}>
					<div class="room-user-list-section">
						<h4>You</h4>
						<UserListItem user={ownUser()!} isOwn={true} />
					</div>
				</Show>

				{/* Other users */}
				<Show when={humanUsers().length > 0}>
					<div class="room-user-list-section">
						<h4>Users ({humanUsers().length})</h4>
						<For each={humanUsers()}>
							{(user) => (
								<Show when={user.roomIndex !== state().ownUserRoomIndex}>
									<UserListItem user={user} isOwn={false} />
								</Show>
							)}
						</For>
					</div>
				</Show>

				{/* Pets */}
				<Show when={pets().length > 0}>
					<div class="room-user-list-section">
						<h4>Pets ({pets().length})</h4>
						<For each={pets()}>
							{(pet) => <UserListItem user={pet} isOwn={false} />}
						</For>
					</div>
				</Show>

				{/* Bots */}
				<Show when={bots().length > 0}>
					<div class="room-user-list-section">
						<h4>Bots ({bots().length})</h4>
						<For each={bots()}>
							{(bot) => <UserListItem user={bot} isOwn={false} />}
						</For>
					</div>
				</Show>
			</div>
		</Show>
	);
};

/**
 * Individual user item in the list
 */
interface UserListItemProps
{
	user: RoomUserData;
	isOwn: boolean;
}

const UserListItem: Component<UserListItemProps> = (props) =>
{
	const typeLabel = createMemo(() =>
	{
		switch (props.user.type)
		{
			case RoomUserType.USER:
				return '';
			case RoomUserType.PET:
				return `Lv.${props.user.petLevel}`;
			case RoomUserType.BOT:
			case RoomUserType.RENTABLE_BOT:
				return 'Bot';
			default:
				return '';
		}
	});

	return (
		<div class={`room-user-item ${props.isOwn ? 'is-own' : ''}`}>
			<div class="room-user-avatar">
				{/* Avatar placeholder - would render actual avatar here */}
				<div class="avatar-placeholder">
					{props.user.name.charAt(0).toUpperCase()}
				</div>
			</div>
			<div class="room-user-info">
				<span class="room-user-name">{props.user.name}</span>
				<Show when={props.user.custom}>
					<span class="room-user-motto">{props.user.custom}</span>
				</Show>
			</div>
			<Show when={typeLabel()}>
				<span class="room-user-type">{typeLabel()}</span>
			</Show>
		</div>
	);
};
