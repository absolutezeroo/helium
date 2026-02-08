import type {JSX} from 'solid-js';
import {createSignal, For, Show} from 'solid-js';
import clsx from 'clsx';
import type {RoomListRoom, RoomListViewMode} from './NavigatorSearchResultItemView';
import {NavigatorSearchResultItemCompactView, NavigatorSearchResultItemView} from './NavigatorSearchResultItemView';
import {useLocalization} from '@ui/common';

export interface NavigatorBlockData
{
	searchCode: string;
	text: string;
	actionAllowed: number;
	forceClosed: boolean;
	viewMode: number;
	rooms: RoomListRoom[];
}

export interface NavigatorSearchResultViewProps
{
	block: NavigatorBlockData;
	displayMode?: RoomListViewMode;
	onRoomClick?: (roomId: number) => void;
	onFavouriteClick?: (roomId: number) => void;
	onInfoClick?: (roomId: number) => void;
}

/**
 * Collapsible section - Habbo classic style.
 */
export function NavigatorSearchResultView(props: NavigatorSearchResultViewProps): JSX.Element
{
	const t = useLocalization();
	const [isExpanded, setIsExpanded] = createSignal(!props.block.forceClosed);
	const displayMode = () => props.displayMode ?? 'cards';

	const title = () => t(props.block.text || props.block.searchCode);

	return (
		<div>
			{/* Section header */}
			<div
				class="nav-section__header"
				onClick={() => setIsExpanded(!isExpanded())}
			>
				<div style={{display: 'flex', 'align-items': 'center'}}>
					<span class="nav-section__title">{title()}</span>
					<Show when={props.block.rooms.length > 0}>
						<span class="nav-section__count">({props.block.rooms.length})</span>
					</Show>
				</div>
				<span class={clsx('nav-section__arrow', isExpanded() && 'nav-section__arrow--open')}>
					&#9654;
				</span>
			</div>

			{/* Rooms */}
			<Show when={isExpanded() && props.block.rooms.length > 0}>
				<div class={displayMode() === 'compact' ? 'nav-rooms--compact' : 'nav-rooms'}>
					<For each={props.block.rooms}>
						{(room) => (
							<Show
								when={displayMode() !== 'compact'}
								fallback={
									<NavigatorSearchResultItemCompactView
										room={room}
										onClick={props.onRoomClick}
									/>
								}
							>
								<NavigatorSearchResultItemView
									room={room}
									onClick={props.onRoomClick}
								/>
							</Show>
						)}
					</For>
				</div>
			</Show>

			{/* Empty */}
			<Show when={isExpanded() && props.block.rooms.length === 0}>
				<div class="nav-empty">Aucun appart</div>
			</Show>
		</div>
	);
}
