import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';
import {FaSolidUser} from 'solid-icons/fa';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator';
import {RoomDoorMode} from '@habbo/communication/messages/incoming/navigator';
import {ModuleId, useActions, useModule} from '@ui/bridge';
import {DoorStateType} from '@/modules/navigator/types';
import {NavigatorSearchResultItemInfoView} from './NavigatorSearchResultItemInfoView';

export interface NavigatorSearchResultItemViewProps
{
	roomData: GuestRoomData;
	thumbnail?: boolean;
}

/**
 * Get Bootstrap badge color class based on user ratio.
 * Matches Nitro's getUserCounterColor logic.
 */
function getUserCounterColor(userCount: number, maxUserCount: number): string
{
	const ratio = maxUserCount > 0 ? (100 * (userCount / maxUserCount)) : 0;

	if (ratio >= 92) return 'bg-danger';
	if (ratio >= 50) return 'bg-warning';
	if (ratio > 0) return 'bg-success';

	return 'bg-primary';
}

/**
 * Get the CSS icon class name for a door mode.
 */
function getDoorModeIconClass(doorMode: number): string
{
	switch (doorMode)
	{
		case RoomDoorMode.DOORBELL: return 'icon icon-navigator-room-locked';
		case RoomDoorMode.PASSWORD: return 'icon icon-navigator-room-password';
		case RoomDoorMode.INVISIBLE: return 'icon icon-navigator-room-invisible';
		default: return '';
	}
}

/**
 * NavigatorSearchResultItemView - Individual room item (list or thumbnail mode).
 *
 * @see source_nitro_react/components/navigator/views/search/NavigatorSearchResultItemView.tsx
 */
export function NavigatorSearchResultItemView(props: NavigatorSearchResultItemViewProps): JSX.Element
{
	const navActions = useActions(ModuleId.Navigator);
	const {state: session} = useModule(ModuleId.Session);

	const visitRoom = () =>
	{
		const roomData = props.roomData;
		const userId = session()?.userData?.id ?? -1;

		if (roomData.ownerId !== userId)
		{
			if (roomData.habboGroupId !== 0)
			{
				navActions.goToRoom(roomData.flatId);
				return;
			}

			switch (roomData.doorMode)
			{
				case RoomDoorMode.DOORBELL:
					navActions.setDoorData({
						roomInfo: roomData,
						state: DoorStateType.START_DOORBELL,
					});
					return;
				case RoomDoorMode.PASSWORD:
					navActions.setDoorData({
						roomInfo: roomData,
						state: DoorStateType.START_PASSWORD,
					});
					return;
			}
		}

		navActions.goToRoom(roomData.flatId);
	};

	const badgeColor = () => getUserCounterColor(props.roomData.userCount, props.roomData.maxUserCount);

	// Thumbnail mode
	if (props.thumbnail)
	{
		return (
			<div
				class="navigator-item d-flex flex-column cursor-pointer overflow-hidden align-items-center p-1 bg-light rounded-3 small mb-1 border border-muted"
				onClick={visitRoom}
				style={{gap: '0'}}
			>
				{/* Room thumbnail */}
				<div
					class="d-flex flex-column align-items-center justify-content-end mb-1 position-relative"
					style={{width: '100%', 'aspect-ratio': '1', background: '#ccc', 'border-radius': '4px', overflow: 'hidden'}}
				>
					<Show
						when={props.roomData.officialRoomPicRef}
						fallback={
							<div class="d-flex align-items-center justify-content-center w-100 h-100 text-muted">
								<i class="icon icon-rooms" />
							</div>
						}
					>
						<img
							src={props.roomData.officialRoomPicRef!}
							alt={props.roomData.roomName}
							style={{width: '100%', height: '100%', 'object-fit': 'cover', 'image-rendering': 'pixelated'}}
						/>
					</Show>

					{/* Group badge */}
					<Show when={props.roomData.habboGroupId > 0}>
						<i class="icon icon-navigator-room-group position-absolute top-0 start-0 m-1" />
					</Show>

					{/* User count badge overlay */}
					<div class={clsx('badge p-1 position-absolute m-1 d-flex align-items-center gap-1', badgeColor())}>
						<FaSolidUser />
						{props.roomData.userCount}
					</div>

					{/* Door mode icon */}
					<Show when={props.roomData.doorMode !== RoomDoorMode.OPEN}>
						<i class={clsx('position-absolute end-0 mb-1 me-1', getDoorModeIconClass(props.roomData.doorMode))} />
					</Show>
				</div>

				{/* Footer: name + info */}
				<div class="d-flex w-100">
					<span class="text-truncate flex-grow-1">{props.roomData.roomName}</span>
					<div class="d-flex flex-row-reverse align-items-center gap-1">
						<NavigatorSearchResultItemInfoView roomData={props.roomData} />
					</div>
				</div>
			</div>
		);
	}

	// List mode
	return (
		<div
			class="navigator-item d-flex cursor-pointer overflow-hidden align-items-center gap-2 px-2 py-1 small"
			onClick={visitRoom}
		>
			<div class={clsx('badge p-1 d-flex align-items-center gap-1', badgeColor())} style={{'min-width': '35px', width: '35px'}}>
				<FaSolidUser />
				{props.roomData.userCount}
			</div>
			<span class="text-truncate flex-grow-1">{props.roomData.roomName}</span>
			<div class="d-flex flex-row-reverse align-items-center gap-1">
				<NavigatorSearchResultItemInfoView roomData={props.roomData} />
				<Show when={props.roomData.habboGroupId > 0}>
					<i class="icon icon-navigator-room-group" />
				</Show>
				<Show when={props.roomData.doorMode !== RoomDoorMode.OPEN}>
					<i class={getDoorModeIconClass(props.roomData.doorMode)} />
				</Show>
			</div>
		</div>
	);
}
