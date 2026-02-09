import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import {RoomDoorMode} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';
import {getUserCounterColor, getDoorModeAsset} from './search/results/roomEntryUtils';

import userCountIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_icon_usercount.png';
import groupIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_icon_group.png';
import eventIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_event_icon.png';
import defaultRoomThumb from '@/assets/images/HabboWindowManagerCom_newnavigator_default_room.png';
import homeYesIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_icon_home_yes.png';
import homeNoIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_icon_home_no.png';
import favYesIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_icon_fav_yes.png';
import favNoIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_icon_fav_no.png';
import settingsIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_room_settings_icon.png';
import reportIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_report_room.png';
import ratingStarOn from '@/assets/images/HabboWindowManagerCom_newnavigator_rating_star_on.png';
import ratingStarOff from '@/assets/images/HabboWindowManagerCom_newnavigator_rating_star_off.png';

export interface RoomInfoPopupProps
{
	roomData: GuestRoomData;
	anchorRef?: HTMLDivElement;
}

/**
 * RoomInfoPopup - Hover popup showing room details.
 *
 * Shows thumbnail, name, owner, description, properties, actions, tags, and event info.
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

	/** Rating stars (0-5 based on score, capped at 5) */
	const ratingStars = () =>
	{
		const score = Math.min(5, Math.max(0, Math.round(props.roomData.score / 20)));
		const stars: boolean[] = [];

		for (let i = 0; i < 5; i++)
		{
			stars.push(i < score);
		}

		return stars;
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
									<img src={defaultRoomThumb} alt="" />
								</div>
							}
						>
							<img
								src={props.roomData.officialRoomPicRef!}
								alt={props.roomData.roomName}
							/>
						</Show>

						{/* Group badge on thumbnail */}
						<Show when={props.roomData.habboGroupId > 0}>
							<img class="popup-group-badge" src={groupIcon} alt="" />
						</Show>

						{/* Door mode icon */}
						<Show when={props.roomData.doorMode !== RoomDoorMode.OPEN}>
							<img class="popup-doormode" src={getDoorModeAsset(props.roomData.doorMode)} alt="" />
						</Show>
					</div>

					{/* Details */}
					<div class="popup-details">
						{/* Room name + home icon */}
						<div class="popup-name-row">
							<Show when={nav.homeRoomId === props.roomData.flatId}>
								<img class="popup-home-icon" src={homeYesIcon} alt="" />
							</Show>
							<span class="popup-room-name">{props.roomData.roomName}</span>
						</div>

						{/* Description */}
						<Show when={props.roomData.description}>
							<span class="popup-description">
								{props.roomData.description}
							</span>
						</Show>
					</div>
				</div>

				{/* Owner / group row */}
				<div class="popup-owner-group">
					<Show when={props.roomData.showOwner}>
						<span class="popup-owner-label">{t('navigator.roomownercaption', 'Owner:')}</span>
						<span class="popup-owner-name">{props.roomData.ownerName}</span>
					</Show>
					<Show when={props.roomData.habboGroupId > 0}>
						<img src={groupIcon} alt="" />
						<span class="popup-group-name">{props.roomData.groupName}</span>
					</Show>
				</div>

				{/* Body: Properties + Actions side by side */}
				<div class="popup-body">
					{/* Properties */}
					<div class="popup-properties">
						{/* Rating */}
						<div class="popup-property-row">
							<span class="property-name">{t('navigator.roomrating', 'Rating:')}</span>
							<div class="rating-stars">
								<For each={ratingStars()}>
									{(isOn) => (
										<img src={isOn ? ratingStarOn : ratingStarOff} alt="" />
									)}
								</For>
							</div>
						</div>

						{/* User count */}
						<div class="popup-property-row">
							<span class="property-name">{t('navigator.roomcount', 'Users:')}</span>
							<div class="property-value">
								<div class={`popup-usercount ${badgeColor()}`}>
									<img src={userCountIcon} alt="" />
									{props.roomData.userCount}/{props.roomData.maxUserCount}
								</div>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div class="popup-actions">
						{/* Favorite */}
						<div class="popup-action">
							<div class="action-icon">
								<img src={favNoIcon} alt="" />
							</div>
							<span>{t('navigator.action.favorite', 'Favorite')}</span>
						</div>

						{/* Home room */}
						<div class="popup-action">
							<div class="action-icon">
								<img src={nav.homeRoomId === props.roomData.flatId ? homeYesIcon : homeNoIcon} alt="" />
							</div>
							<span>{t('navigator.action.homeroom', 'Home Room')}</span>
						</div>

						{/* Settings */}
						<div class="popup-action">
							<div class="action-icon">
								<img src={settingsIcon} alt="" />
							</div>
							<span>{t('navigator.action.settings', 'Settings')}</span>
						</div>

						{/* Report */}
						<div class="popup-action">
							<div class="action-icon">
								<img src={reportIcon} alt="" />
							</div>
							<span>{t('navigator.action.report', 'Report')}</span>
						</div>
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

				{/* Room ad / event info */}
				<Show when={props.roomData.roomAdName}>
					<div class="popup-event">
						<img src={eventIcon} alt="" />
						<div class="popup-event-content">
							<span class="popup-event-title">{props.roomData.roomAdName}</span>
							<Show when={props.roomData.roomAdDescription}>
								<span>{props.roomData.roomAdDescription}</span>
							</Show>
						</div>
					</div>
				</Show>
			</div>
		</div>
	);
}
