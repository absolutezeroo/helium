import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import clsx from 'clsx';
import {FaSolidUser} from 'solid-icons/fa';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import {RoomDoorMode} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import {useNavigator, DoorStateType} from '@ui/hooks/navigator/useNavigator';
import {sessionStore} from '@ui/stores/sessionStore';
import {getUserCounterColor, getDoorModeIconClass} from './roomEntryUtils';
import {RoomInfoPopup} from '../../RoomInfoPopup';

export interface RoomEntryRowProps
{
	roomData: GuestRoomData;
}

/**
 * RoomEntryRow - Room entry in list (row) mode.
 *
 * Shows user count badge, room name, door mode icon, group badge, and info popup on hover.
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/search/results/RoomEntryElementFactory.as
 */
export function RoomEntryRow(props: RoomEntryRowProps): JSX.Element
{
	const {actions} = useNavigator();
	const {state: session} = sessionStore;

	const [showInfo, setShowInfo] = createSignal(false);

	let hoverTimer: ReturnType<typeof setTimeout> | undefined;
	let rowRef: HTMLDivElement | undefined;

	const badgeColor = () => getUserCounterColor(props.roomData.userCount, props.roomData.maxUserCount);

	/**
	 * Handle click to visit room, respecting door modes
	 * @see RoomEntryElementFactory.as _Str_23456
	 */
	const visitRoom = () =>
	{
		const roomData = props.roomData;
		const userId = session?.userData?.userId ?? -1;

		if (roomData.ownerId !== userId)
		{
			if (roomData.habboGroupId !== 0)
			{
				actions.goToRoom(roomData.flatId);
				return;
			}

			switch (roomData.doorMode)
			{
				case RoomDoorMode.DOORBELL:
					actions.setDoorData({
						roomInfo: roomData,
						state: DoorStateType.START_DOORBELL,
					});
					return;
				case RoomDoorMode.PASSWORD:
					actions.setDoorData({
						roomInfo: roomData,
						state: DoorStateType.START_PASSWORD,
					});
					return;
			}
		}

		actions.goToRoom(roomData.flatId);
	};

	const onMouseEnter = () =>
	{
		hoverTimer = setTimeout(() => setShowInfo(true), 300);
	};

	const onMouseLeave = () =>
	{
		if (hoverTimer) clearTimeout(hoverTimer);
		setShowInfo(false);
	};

	return (
		<div
			ref={rowRef}
			class="navigator-row position-relative"
			onClick={visitRoom}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			{/* User count badge */}
			<div class={clsx('row-usercount', badgeColor())}>
				<FaSolidUser />
				{props.roomData.userCount}
			</div>

			{/* Room name */}
			<span class="row-name">{props.roomData.roomName}</span>

			{/* Icons */}
			<div class="row-icons">
				{/* Info popup trigger */}
				<div
					class="icon icon-navigator-info row-info-btn"
					onClick={(e) =>
					{
						e.stopPropagation();
						setShowInfo(v => !v);
					}}
				/>
				{/* Group badge */}
				<Show when={props.roomData.habboGroupId > 0}>
					<i class="icon icon-navigator-room-group" />
				</Show>
				{/* Door mode icon */}
				<Show when={props.roomData.doorMode !== RoomDoorMode.OPEN}>
					<i class={getDoorModeIconClass(props.roomData.doorMode)} />
				</Show>
			</div>

			{/* Room info popup */}
			<Show when={showInfo()}>
				<RoomInfoPopup roomData={props.roomData} anchorRef={rowRef} />
			</Show>
		</div>
	);
}
