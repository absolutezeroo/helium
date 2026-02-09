import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import clsx from 'clsx';
import {FaSolidUser, FaSolidStar, FaSolidHouse} from 'solid-icons/fa';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import {RoomDoorMode} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';
import {getUserCounterColor, getDoorModeIconClass} from './search/results/roomEntryUtils';

export interface RoomInfoPopupProps
{
	roomData: GuestRoomData;
	anchorRef?: HTMLDivElement;
}

/**
 * RoomInfoPopup - Hover popup showing room details.
 *
 * Shows thumbnail, name, owner, description, user count, tags, and group info.
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/RoomInfoPopup.as
 */
export function RoomInfoPopup(props: RoomInfoPopupProps): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const badgeColor = () => getUserCounterColor(props.roomData.userCount, props.roomData.maxUserCount);

	const handleTagClick = (e: MouseEvent, tag: string) =>
	{
		e.stopPropagation();
		actions.performTagSearch(tag);
	};

	return (
		<div class="room-info-popup" onClick={(e) => e.stopPropagation()}>
			<div class="popup-content">
				{/* Header: thumbnail + details */}
				<div class="popup-header">
					{/* Thumbnail (112x112, 110x110 img, black border) */}
					<div class="popup-thumbnail">
						<Show
							when={props.roomData.officialRoomPicRef}
							fallback={
								<div class="popup-thumbnail-placeholder">
									<i class="icon icon-rooms" />
								</div>
							}
						>
							<img
								src={props.roomData.officialRoomPicRef!}
								alt={props.roomData.roomName}
							/>
						</Show>

						{/* Door mode icon */}
						<Show when={props.roomData.doorMode !== RoomDoorMode.OPEN}>
							<i class={clsx('popup-doormode', getDoorModeIconClass(props.roomData.doorMode))} />
						</Show>
					</div>

					{/* Details */}
					<div class="popup-details">
						{/* Room name + home icon */}
						<div class="d-flex align-items-center gap-1">
							<Show when={nav.homeRoomId === props.roomData.flatId}>
								<FaSolidHouse class="text-primary popup-home-icon" />
							</Show>
							<span class="popup-room-name">{props.roomData.roomName}</span>
						</div>

						{/* Owner */}
						<Show when={props.roomData.showOwner}>
							<div class="popup-owner-group">
								<span class="text-muted">{t('navigator.roomownercaption', 'Owner:')}</span>
								<span class="popup-owner-name">{props.roomData.ownerName}</span>
							</div>
						</Show>

						{/* Description */}
						<Show when={props.roomData.description}>
							<span style={{'max-height': '32px', overflow: 'hidden', 'font-size': '11px'}}>
								{props.roomData.description}
							</span>
						</Show>

						{/* Group */}
						<Show when={props.roomData.habboGroupId > 0}>
							<div class="popup-owner-group">
								<i class="icon icon-navigator-room-group" />
								<span class="popup-group-name">{props.roomData.groupName}</span>
							</div>
						</Show>
					</div>
				</div>

				{/* Tags */}
				<Show when={props.roomData.tags.length > 0}>
					<div class="popup-tags">
						<For each={props.roomData.tags}>
							{(tag) => (
								<span class="popup-tag" onClick={(e) => handleTagClick(e, tag)}>
									#{tag}
								</span>
							)}
						</For>
					</div>
				</Show>

				{/* User count + score */}
				<div class="popup-stats">
					<div class={clsx('popup-usercount', badgeColor())}>
						<FaSolidUser />
						{props.roomData.userCount}/{props.roomData.maxUserCount}
					</div>
					<Show when={props.roomData.score > 0}>
						<div class="popup-score">
							<FaSolidStar />
							{props.roomData.score}
						</div>
					</Show>
				</div>

				{/* Room ad / event info */}
				<Show when={props.roomData.roomAdName}>
					<div class="popup-event">
						<span class="popup-event-title">{props.roomData.roomAdName}</span>
						<Show when={props.roomData.roomAdDescription}>
							<span class="d-block">{props.roomData.roomAdDescription}</span>
						</Show>
					</div>
				</Show>
			</div>
		</div>
	);
}
