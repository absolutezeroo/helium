import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import clsx from 'clsx';
import {FaSolidCircleInfo, FaSolidDoorOpen, FaSolidUser} from 'solid-icons/fa';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator';
import {useLocalization} from '@ui/common';

interface NavigatorSearchResultItemInfoViewProps
{
	roomData: GuestRoomData;
}

/**
 * Get badge color based on user count ratio.
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
 * NavigatorSearchResultItemInfoView - Popover shown on hover over info icon.
 *
 * @see source_nitro_react/components/navigator/views/search/NavigatorSearchResultItemInfoView.tsx
 */
export function NavigatorSearchResultItemInfoView(props: NavigatorSearchResultItemInfoViewProps): JSX.Element
{
	const t = useLocalization();
	const [isVisible, setIsVisible] = createSignal(false);

	const badgeColor = () => getUserCounterColor(props.roomData.userCount, props.roomData.maxUserCount);

	return (
		<span
			class="cursor-pointer position-relative"
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
			onClick={(e) => e.stopPropagation()}
		>
			<FaSolidCircleInfo />

			<Show when={isVisible()}>
				<div
					class="room-info bg-transparent overflow-hidden position-absolute"
					style={{
						right: '100%',
						top: '50%',
						transform: 'translateY(-50%)',
						'margin-right': '8px',
						'z-index': '10',
						'image-rendering': 'pixelated',
					}}
				>
					<div class="container-fluid content-area">
						<div class="d-flex gap-2 overflow-hidden">
							{/* Thumbnail */}
							<div
								class="d-flex flex-column align-items-center justify-content-end mb-1 position-relative"
								style={{width: '110px', height: '110px', 'min-width': '110px', background: '#ccc', 'border-radius': '4px', overflow: 'hidden'}}
							>
								<Show
									when={props.roomData.officialRoomPicRef}
									fallback={
										<div class="d-flex align-items-center justify-content-center w-100 h-100 text-muted">
											<FaSolidDoorOpen size={32} />
										</div>
									}
								>
									<img
										src={props.roomData.officialRoomPicRef!}
										alt={props.roomData.roomName}
										style={{width: '100%', height: '100%', 'object-fit': 'cover', 'image-rendering': 'pixelated'}}
									/>
								</Show>
							</div>

							{/* Details */}
							<div class="d-flex flex-column gap-1">
								<span class="fw-bold text-truncate flex-grow-1" style={{'max-height': '13px'}}>
									{props.roomData.roomName}
								</span>
								<div class="d-flex gap-2">
									<span class="fst-italic text-muted">
										{t('navigator.roomownercaption', 'Owner:')}
									</span>
									<span class="fst-italic">
										{props.roomData.ownerName}
									</span>
								</div>
								<Show when={props.roomData.description}>
									<span class="flex-grow-1">{props.roomData.description}</span>
								</Show>
								<div class={clsx('badge p-1 position-absolute m-1 bottom-0 end-0 m-2 d-flex align-items-center gap-1', badgeColor())}>
									<FaSolidUser />
									{props.roomData.userCount}
								</div>
							</div>
						</div>
					</div>
				</div>
			</Show>
		</span>
	);
}
