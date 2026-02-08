import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';
import {FaSolidDoorOpen, FaSolidBell, FaSolidLock, FaSolidEyeSlash, FaSolidUsers} from 'solid-icons/fa';

export interface RoomListRoom
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
	score?: number;
	categoryId?: number;
}

export type RoomListViewMode = 'cards' | 'compact' | 'grid';

interface ItemProps
{
	room: RoomListRoom;
	onClick?: (roomId: number) => void;
}

function DoorIcon(props: { mode?: string }): JSX.Element
{
	switch (props.mode)
	{
		case 'doorbell':
			return <FaSolidBell size={10} />;
		case 'password':
			return <FaSolidLock size={10} />;
		case 'invisible':
			return <FaSolidEyeSlash size={10} />;
		default:
			return <FaSolidDoorOpen size={10} />;
	}
}

function getUserBadgeClass(userCount: number, maxUserCount: number): string
{
	const ratio = maxUserCount > 0 ? userCount / maxUserCount : 0;
	if (ratio >= 1) return 'nav-room-card__users--full';
	if (ratio >= 0.7) return 'nav-room-card__users--busy';
	return '';
}

/**
 * Room card - grid mode.
 * Thumbnail on top, info below (matches mockup/navigator_base.png).
 */
export function NavigatorSearchResultItemView(props: ItemProps): JSX.Element
{
	const room = () => props.room;

	return (
		<div
			class="nav-room-card"
			onClick={() => props.onClick?.(room().id)}
		>
			{/* Thumbnail on top */}
			<div class="nav-room-card__thumb">
				<Show
					when={room().thumbnail}
					fallback={
						<span class="nav-room-card__thumb-placeholder">
							<FaSolidDoorOpen size={22} />
						</span>
					}
				>
					<img src={room().thumbnail} alt={room().name} />
				</Show>
			</div>

			{/* Info below */}
			<div class="nav-room-card__info">
				<span class="nav-room-card__name">{room().name}</span>
				<span class="nav-room-card__owner">{room().ownerName}</span>
				<span class={clsx(
					'nav-room-card__users',
					getUserBadgeClass(room().userCount, room().maxUserCount)
				)}>
					<FaSolidUsers size={8} />
					{room().userCount}/{room().maxUserCount}
				</span>
			</div>
		</div>
	);
}

/**
 * Room row - compact/list mode.
 */
export function NavigatorSearchResultItemCompactView(props: ItemProps): JSX.Element
{
	const room = () => props.room;

	return (
		<div
			class="nav-room-row"
			onClick={() => props.onClick?.(room().id)}
		>
			<span class="nav-room-row__door">
				<DoorIcon mode={room().doorMode} />
			</span>
			<span class="nav-room-row__name">{room().name}</span>
			<span class="nav-room-row__owner">{room().ownerName}</span>
			<span class={clsx(
				'nav-room-row__users',
				getUserBadgeClass(room().userCount, room().maxUserCount)
			)}>
				{room().userCount}
			</span>
		</div>
	);
}
