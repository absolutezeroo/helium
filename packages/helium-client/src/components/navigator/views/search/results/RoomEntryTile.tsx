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

export interface RoomEntryTileProps
{
	roomData: GuestRoomData;
}

/**
 * RoomEntryTile - Room entry in tile (thumbnail) mode.
 *
 * Shows a thumbnail image with overlaid badges and the room name below.
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/search/results/RoomEntryElementFactory.as
 */
export function RoomEntryTile(props: RoomEntryTileProps): JSX.Element
{
	const {actions} = useNavigator();
	const {state: session} = sessionStore;

	const [showInfo, setShowInfo] = createSignal(false);

	let tileRef: HTMLDivElement | undefined;

	const badgeColor = () => getUserCounterColor(props.roomData.userCount, props.roomData.maxUserCount);

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

	return (
		<div
			ref={tileRef}
			class="navigator-tile position-relative"
			onClick={visitRoom}
			onMouseEnter={() => setShowInfo(true)}
			onMouseLeave={() => setShowInfo(false)}
		>
			{/* Thumbnail */}
			<div class="tile-thumbnail">
				<Show
					when={props.roomData.officialRoomPicRef}
					fallback={
						<div class="tile-placeholder">
							<i class="icon icon-rooms" />
						</div>
					}
				>
					<img
						src={props.roomData.officialRoomPicRef!}
						alt={props.roomData.roomName}
					/>
				</Show>

				{/* Group badge */}
				<Show when={props.roomData.habboGroupId > 0}>
					<i class="icon icon-navigator-room-group tile-group-badge" />
				</Show>

				{/* User count badge */}
				<div class={clsx('tile-usercount', badgeColor())}>
					<FaSolidUser />
					{props.roomData.userCount}
				</div>

				{/* Door mode icon */}
				<Show when={props.roomData.doorMode !== RoomDoorMode.OPEN}>
					<i class={clsx('tile-doormode', getDoorModeIconClass(props.roomData.doorMode))} />
				</Show>
			</div>

			{/* Room name + info */}
			<div class="tile-footer">
				<span class="tile-room-name">{props.roomData.roomName}</span>
			</div>

			{/* Room info popup */}
			<Show when={showInfo()}>
				<RoomInfoPopup roomData={props.roomData} anchorRef={tileRef} />
			</Show>
		</div>
	);
}
