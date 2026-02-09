import type {JSX} from 'solid-js';
import {createSignal, For, Show} from 'solid-js';
import clsx from 'clsx';
import {FaSolidLink} from 'solid-icons/fa';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {sessionStore} from '@ui/stores/sessionStore';
import {useLocalization} from '@ui/common';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardView} from '@ui/common/card';

/**
 * NavigatorRoomInfoView - Room info panel for the currently entered room.
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/RoomInfoPopup.as
 */
export function NavigatorRoomInfoView(): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();
	const {state: session} = sessionStore;

	const [isRoomPicked, setIsRoomPicked] = createSignal(false);
	const [isRoomMuted, setIsRoomMuted] = createSignal(false);

	const enteredRoom = () => nav.enteredRoomData;
	const homeRoomId = () => nav.homeRoomId;

	const hasPermission = (permission: string): boolean =>
	{
		const room = enteredRoom();
		const userData = session?.userData;

		if (!room || !userData) return false;

		switch (permission)
		{
			case 'settings':
				return userData.userId === room.ownerId || (session?.securityLevel ?? 0) >= 4;
			case 'staff_pick':
				return (session?.securityLevel ?? 0) >= 3;
			default:
				return false;
		}
	};

	const processAction = (action: string, value?: string) =>
	{
		const room = enteredRoom();

		if (!room) return;

		switch (action)
		{
			case 'set_home_room':
				// TODO: Send UpdateHomeRoomMessageComposer
				return;
			case 'navigator_search_tag':
				if (value) actions.performTagSearch(value);
				return;
			case 'toggle_room_link':
				actions.toggleRoomLink();
				return;
			case 'open_room_settings':
				// TODO: Send RoomSettingsComposer
				return;
			case 'toggle_pick':
				setIsRoomPicked((v) => !v);
				// TODO: Send ToggleStaffPickMessageComposer
				return;
			case 'toggle_mute':
				setIsRoomMuted((v) => !v);
				// TODO: Send RoomMuteComposer
				return;
			case 'room_filter':
				// TODO: Send GetCustomRoomFilterMessageComposer
				return;
			case 'open_floorplan_editor':
				// TODO: CreateLinkEvent('floor-editor/toggle')
				return;
			case 'report_room':
				// TODO: Report room
				return;
			case 'close':
				actions.closeRoomInfo();
				return;
		}
	};

	return (
		<Show when={nav.isRoomInfoOpen && enteredRoom()}>
			<HeliumCardView uniqueKey="room-info" class="helium-room-info" theme="primary-slim">
				<HeliumCardHeaderView
					title={t('navigator.roomsettings.roominfo', 'Room Info')}
					onClose={() => processAction('close')}
				/>
				<HeliumCardContentView class="text-black">
					<div class="d-flex gap-2 overflow-hidden">
						{/* Room thumbnail */}
						<div
							class="d-flex flex-column align-items-center justify-content-end position-relative flex-shrink-0"
							style={{width: '110px', height: '110px', background: '#ccc', 'border-radius': '4px', overflow: 'hidden'}}
						>
							<Show
								when={enteredRoom()!.officialRoomPicRef}
								fallback={
									<div class="d-flex align-items-center justify-content-center w-100 h-100 text-muted">
										<i class="icon icon-rooms" />
									</div>
								}
							>
								<img
									src={enteredRoom()!.officialRoomPicRef!}
									alt={enteredRoom()!.roomName}
									style={{width: '100%', height: '100%', 'object-fit': 'cover', 'image-rendering': 'pixelated'}}
								/>
							</Show>
							<Show when={hasPermission('settings')}>
								<i
									class="icon icon-camera-small position-absolute cursor-pointer"
									style={{top: '4px', right: '4px'}}
								/>
							</Show>
						</div>

						{/* Room details */}
						<div class="d-flex flex-column gap-1 overflow-hidden flex-grow-1">
							<div class="d-flex gap-1">
								<div class="d-flex flex-column gap-1 flex-grow-1">
									<div class="d-flex gap-1 align-items-center">
										<i
											class={clsx(
												'icon icon-house-small cursor-pointer flex-shrink-0',
												homeRoomId() !== enteredRoom()!.flatId && 'gray'
											)}
											onClick={() => processAction('set_home_room')}
										/>
										<span class="fw-bold">{enteredRoom()!.roomName}</span>
									</div>
									<Show when={enteredRoom()!.showOwner}>
										<div class="d-flex align-items-center gap-1">
											<span class="text-muted">{t('navigator.roomownercaption', 'Owner:')}</span>
											<span>{enteredRoom()!.ownerName}</span>
										</div>
									</Show>
									<div class="d-flex align-items-center gap-1">
										<span class="text-muted">{t('navigator.roomrating', 'Rating:')}</span>
										<span>{enteredRoom()!.score}</span>
									</div>
									<Show when={enteredRoom()!.tags.length > 0}>
										<div class="room-info-tags">
											<For each={enteredRoom()!.tags}>
												{(tag) => (
													<span
														class="room-info-tag"
														onClick={() => processAction('navigator_search_tag', tag)}
													>
														#{tag}
													</span>
												)}
											</For>
										</div>
									</Show>
								</div>

								{/* Settings + link icons */}
								<div class="d-flex flex-column align-items-center gap-1">
									<Show when={hasPermission('settings')}>
										<i
											class="icon icon-cog cursor-pointer"
											title={t('navigator.room.popup.info.room.settings', 'Room Settings')}
											onClick={() => processAction('open_room_settings')}
										/>
									</Show>
									<FaSolidLink
										class="cursor-pointer"
										title={t('navigator.embed.caption', 'Embed')}
										onClick={() => processAction('toggle_room_link')}
									/>
								</div>
							</div>

							{/* Description */}
							<span class="overflow-auto" style={{'max-height': '50px'}}>
								{enteredRoom()!.description}
							</span>

							{/* Group info */}
							<Show when={enteredRoom()!.habboGroupId > 0}>
								<div class="d-flex align-items-center gap-1 cursor-pointer">
									<span class="text-decoration-underline">
										{t('navigator.guildbase', 'Group: ') + enteredRoom()!.groupName}
									</span>
								</div>
							</Show>
						</div>
					</div>

					{/* Action buttons */}
					<div class="d-flex flex-column gap-1 mt-2">
						<Show when={hasPermission('staff_pick')}>
							<button class="btn btn-sm btn-primary" onClick={() => processAction('toggle_pick')}>
								{t(isRoomPicked() ? 'navigator.staffpicks.unpick' : 'navigator.staffpicks.pick', isRoomPicked() ? 'Unpick' : 'Staff Pick')}
							</button>
						</Show>
						<button class="btn btn-sm btn-danger" onClick={() => processAction('report_room')}>
							{t('help.emergency.main.report.room', 'Report Room')}
						</button>
						<Show when={hasPermission('settings')}>
							<button class="btn btn-sm btn-primary" onClick={() => processAction('toggle_mute')}>
								{t(isRoomMuted() ? 'navigator.muteall_on' : 'navigator.muteall_off', isRoomMuted() ? 'Unmute All' : 'Mute All')}
							</button>
							<button class="btn btn-sm btn-primary" onClick={() => processAction('room_filter')}>
								{t('navigator.roomsettings.roomfilter', 'Room Filter')}
							</button>
							<button class="btn btn-sm btn-primary" onClick={() => processAction('open_floorplan_editor')}>
								{t('open.floor.plan.editor', 'Floor Plan Editor')}
							</button>
						</Show>
					</div>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
