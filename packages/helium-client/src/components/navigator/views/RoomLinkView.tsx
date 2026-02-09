import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardView} from '@ui/common/card';

/**
 * RoomLinkView - Room embed/share link dialog.
 *
 * @see source_nitro_react/components/navigator/views/NavigatorRoomLinkView.tsx
 */
export function RoomLinkView(): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const roomData = () => nav.enteredRoomData;

	return (
		<Show when={nav.isRoomLinkOpen && roomData()}>
			<HeliumCardView uniqueKey="room-link" class="helium-room-link" theme="primary-slim">
				<HeliumCardHeaderView
					title={t('navigator.embed.title', 'Room Link')}
					onClose={() => actions.closeRoomLink()}
				/>
				<HeliumCardContentView class="text-black d-flex align-items-center">
					<div class="d-flex gap-2">
						{/* Room thumbnail */}
						<div
							class="d-flex flex-column align-items-center justify-content-end flex-shrink-0"
							style={{width: '110px', height: '110px', background: '#ccc', 'border-radius': '4px', overflow: 'hidden'}}
						>
							<Show
								when={roomData()!.officialRoomPicRef}
								fallback={
									<div class="d-flex align-items-center justify-content-center w-100 h-100 text-muted">
										<i class="icon icon-rooms" />
									</div>
								}
							>
								<img
									src={roomData()!.officialRoomPicRef!}
									alt={roomData()!.roomName}
									style={{width: '100%', height: '100%', 'object-fit': 'cover', 'image-rendering': 'pixelated'}}
								/>
							</Show>
						</div>

						{/* Embed info */}
						<div class="d-flex flex-column gap-1">
							<span class="fw-bold fs-5">
								{t('navigator.embed.headline', 'Share this room')}
							</span>
							<span>
								{t('navigator.embed.info', 'Copy the link below to share this room.')}
							</span>
							<input
								type="text"
								readOnly
								class="form-control form-control-sm"
								value={`/room/${roomData()!.flatId}`}
							/>
						</div>
					</div>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
