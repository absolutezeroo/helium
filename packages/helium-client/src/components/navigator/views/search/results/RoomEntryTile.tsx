import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import {RoomDoorMode} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import {useNavigator, DoorStateType} from '@ui/hooks/navigator/useNavigator';
import {sessionStore} from '@ui/stores/sessionStore';
import {getUserCounterColor, getDoorModeAsset} from './roomEntryUtils';
import {RoomInfoPopup} from '../../RoomInfoPopup';

import userCountIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_icon_usercount.png';
import infoIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_button_show_room_info.png';
import groupIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_icon_group.png';
import defaultRoomThumb from '@/assets/images/HabboWindowManagerCom_newnavigator_default_room.png';

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
			class="navigator-tile"
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
							<img src={defaultRoomThumb} alt="" />
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
					<img class="tile-group-badge" src={groupIcon} alt="" />
				</Show>

				{/* User count badge */}
				<div class={`tile-usercount ${badgeColor()}`}>
					<img src={userCountIcon} alt="" />
					{props.roomData.userCount}
				</div>

				{/* Door mode icon */}
				<Show when={props.roomData.doorMode !== RoomDoorMode.OPEN}>
					<img class="tile-doormode" src={getDoorModeAsset(props.roomData.doorMode)} alt="" />
				</Show>
			</div>

			{/* Room name + info */}
			<div class="tile-footer">
				<span class="tile-room-name">{props.roomData.roomName}</span>
				<img
					class="tile-info-btn"
					src={infoIcon}
					alt=""
					onClick={(e) =>
					{
						e.stopPropagation();
						setShowInfo(v => !v);
					}}
				/>
			</div>

			{/* Room info popup */}
			<Show when={showInfo()}>
				<RoomInfoPopup roomData={props.roomData} anchorRef={tileRef} />
			</Show>
		</div>
	);
}
