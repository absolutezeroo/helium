import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import {ModuleId, useActions} from '@ui/bridge';
import {useLocalization} from '@ui/common';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardView} from '@ui/common/card';

export interface NavigatorRoomLinkViewProps
{
	onCloseClick: () => void;
}

/**
 * NavigatorRoomLinkView - Room embed code display.
 *
 * @see source_nitro_react/components/navigator/views/NavigatorRoomLinkView.tsx
 */
export function NavigatorRoomLinkView(props: NavigatorRoomLinkViewProps): JSX.Element
{
	const t = useLocalization();
	const navActions = useActions(ModuleId.Navigator);

	const enteredRoom = () => navActions.getEnteredRoom();

	return (
		<Show when={enteredRoom()}>
			<HeliumCardView uniqueKey="room-link" class="helium-room-link" theme="primary-slim">
				<HeliumCardHeaderView
					title={t('navigator.embed.title', 'Room Link')}
					onClose={props.onCloseClick}
				/>
				<HeliumCardContentView class="text-black d-flex align-items-center">
					<div class="d-flex gap-2">
						{/* Room thumbnail */}
						<div
							class="d-flex flex-column align-items-center justify-content-end flex-shrink-0"
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
								value={`/room/${enteredRoom()!.flatId}`}
							/>
						</div>
					</div>
				</HeliumCardContentView>
			</HeliumCardView>
		</Show>
	);
}
