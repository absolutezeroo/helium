import {Component, createMemo, For, Show} from 'solid-js';
import clsx from 'clsx';
import {ModuleId, useModule} from '../../bridge';
import type {RoomUserData} from '@/modules';
import {RoomUserType} from '@/modules';

/**
 * RoomUserList
 *
 * Displays the list of users currently in the room.
 * Shows users, pets, and bots separately.
 */
export const RoomUserList: Component = () =>
{
	const {state} = useModule(ModuleId.Room);

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

	return (
		<Show when={state().currentRoom !== null}>
			<div class="glass rounded-[var(--radius-lg)] p-4 flex-1 overflow-y-auto">
				<div class="flex items-center gap-2 mb-3">
					<h3 class="text-sm font-semibold text-text-primary m-0 flex-1">
						Room Users ({Object.keys(state().users).length})
					</h3>
					<Show when={state().isRoomOwner}>
						<span
							class="text-[0.625rem] font-semibold px-2 py-0.5 rounded-full uppercase bg-credits/15 text-credits">
							Owner
						</span>
					</Show>
					<Show when={!state().isRoomOwner && state().roomControllerLevel > 0}>
						<span
							class="text-[0.625rem] font-semibold px-2 py-0.5 rounded-full uppercase bg-success/15 text-success">
							Rights
						</span>
					</Show>
				</div>

				{/* Own user */}
				<Show when={ownUser()}>
					<UserSection title="You">
						<UserListItem user={ownUser()!} isOwn={true}/>
					</UserSection>
				</Show>

				{/* Other users */}
				<Show when={humanUsers().length > 0}>
					<UserSection title={`Users (${humanUsers().length})`}>
						<For each={humanUsers()}>
							{(user) => (
								<Show when={user.roomIndex !== state().ownUserRoomIndex}>
									<UserListItem user={user} isOwn={false}/>
								</Show>
							)}
						</For>
					</UserSection>
				</Show>

				{/* Pets */}
				<Show when={pets().length > 0}>
					<UserSection title={`Pets (${pets().length})`}>
						<For each={pets()}>
							{(pet) => <UserListItem user={pet} isOwn={false}/>}
						</For>
					</UserSection>
				</Show>

				{/* Bots */}
				<Show when={bots().length > 0}>
					<UserSection title={`Bots (${bots().length})`}>
						<For each={bots()}>
							{(bot) => <UserListItem user={bot} isOwn={false}/>}
						</For>
					</UserSection>
				</Show>
			</div>
		</Show>
	);
};

function UserSection(props: { title: string; children: any })
{
	return (
		<div class="mb-3 last:mb-0">
			<h4 class="text-[0.625rem] font-semibold uppercase text-text-muted mb-2 pb-1 border-b border-border">
				{props.title}
			</h4>
			{props.children}
		</div>
	);
}

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
		<div class={clsx(
			'flex items-center gap-2.5 p-2 rounded-[var(--radius-md)] transition-colors duration-150 cursor-pointer',
			props.isOwn
				? 'bg-accent-muted hover:bg-[rgba(99,102,241,0.25)]'
				: 'hover:bg-surface-hover'
		)}>
			<div class="flex-shrink-0">
				<div
					class="w-8 h-8 bg-bg-hover rounded-[var(--radius-sm)] flex items-center justify-center text-sm font-semibold text-text-secondary">
					{props.user.name.charAt(0).toUpperCase()}
				</div>
			</div>
			<div class="flex-1 min-w-0">
				<span
					class="block text-[0.8125rem] font-medium text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
					{props.user.name}
				</span>
				<Show when={props.user.custom}>
					<span
						class="block text-[0.6875rem] text-text-muted overflow-hidden text-ellipsis whitespace-nowrap">
						{props.user.custom}
					</span>
				</Show>
			</div>
			<Show when={typeLabel()}>
				<span
					class="text-[0.625rem] font-medium text-text-muted bg-surface-active px-1.5 py-0.5 rounded-[var(--radius-sm)]">
					{typeLabel()}
				</span>
			</Show>
		</div>
	);
};
