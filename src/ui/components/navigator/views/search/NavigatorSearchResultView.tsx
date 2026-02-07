import type {JSX} from 'solid-js';
import {createSignal, For, Show} from 'solid-js';
import clsx from 'clsx';
import {NavigatorIcon} from '../../common';
import type {RoomListRoom, RoomListViewMode} from './NavigatorSearchResultItemView';
import {NavigatorSearchResultItemCompactView, NavigatorSearchResultItemView,} from './NavigatorSearchResultItemView';
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
 * Collapsible section for a navigator search result block.
 * Each block (e.g. "Official", "Room bundles") is rendered as one of these.
 */
export function NavigatorSearchResultView(props: NavigatorSearchResultViewProps): JSX.Element
{
	const t = useLocalization();
	const [isExpanded, setIsExpanded] = createSignal(!props.block.forceClosed);

	const displayMode = () => props.displayMode ?? 'compact';

	const title = () =>
	{
		const text = props.block.text || props.block.searchCode;

		return t(text);
	};

	const containerClass = () =>
	{
		switch (displayMode())
		{
			case 'grid':
				return 'grid grid-cols-2 gap-2 p-3';
			case 'compact':
				return 'flex flex-col';
			default:
				return 'flex flex-col gap-2 p-3';
		}
	};

	return (
		<div class="border-b border-slate-700/50 last:border-b-0">
			{/* Block header */}
			<button
				type="button"
				class={clsx(
					'w-full flex items-center justify-between',
					'px-4 py-2.5',
					'bg-slate-800/60 hover:bg-slate-700/60',
					'transition-colors duration-150',
					'select-none cursor-pointer'
				)}
				onClick={() => setIsExpanded(!isExpanded())}
			>
				<div class="flex items-center gap-2 min-w-0">
					<NavigatorIcon name="room" size="sm" class="text-slate-400 flex-shrink-0"/>
					<span class="text-sm font-medium text-slate-200 truncate">
						{title()}
					</span>
					<Show when={props.block.rooms.length > 0}>
						<span class="text-xs text-slate-500">
							({props.block.rooms.length})
						</span>
					</Show>
				</div>
				<NavigatorIcon
					name={isExpanded() ? 'chevronDown' : 'chevronRight'}
					size="sm"
					class="text-slate-400 flex-shrink-0"
				/>
			</button>

			{/* Rooms */}
			<Show when={isExpanded() && props.block.rooms.length > 0}>
				<div class={containerClass()}>
					<For each={props.block.rooms}>
						{(room) => (
							<Show
								when={displayMode() !== 'compact'}
								fallback={
									<NavigatorSearchResultItemCompactView
										room={room}
										onClick={props.onRoomClick}
										onFavouriteClick={props.onFavouriteClick}
									/>
								}
							>
								<NavigatorSearchResultItemView
									room={room}
									onClick={props.onRoomClick}
									onFavouriteClick={props.onFavouriteClick}
									onInfoClick={props.onInfoClick}
								/>
							</Show>
						)}
					</For>
				</div>
			</Show>

			{/* Empty state */}
			<Show when={isExpanded() && props.block.rooms.length === 0}>
				<div class="px-4 py-3 text-xs text-slate-500 text-center">
					{t('navigator.search.noresults', 'No rooms')}
				</div>
			</Show>
		</div>
	);
}
