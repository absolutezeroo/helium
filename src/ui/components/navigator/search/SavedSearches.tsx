import type {JSX} from 'solid-js';
import {For, Show, createSignal} from 'solid-js';
import clsx from 'clsx';
import {NavigatorIcon} from '../common';
import {useNavigatorLocalization} from '../hooks';

export interface SavedSearch
{
	id: number;
	searchCode: string;
	filter: string;
	localization?: string;
}

export interface SavedSearchesProps
{
	searches: SavedSearch[];
	loading?: boolean;
	expanded?: boolean;
	onSearchClick?: (search: SavedSearch) => void;
	onDeleteSearch?: (id: number) => void;
	onSaveCurrentSearch?: () => void;
	onToggleExpand?: () => void;
	class?: string;
}

/**
 * Saved searches panel - displays user's saved navigator searches
 */
export function SavedSearches(props: SavedSearchesProps): JSX.Element
{
	const {t, keys} = useNavigatorLocalization();
	const [hoveredId, setHoveredId] = createSignal<number | null>(null);

	const handleSearchClick = (search: SavedSearch) =>
	{
		props.onSearchClick?.(search);
	};

	const handleDelete = (e: MouseEvent, id: number) =>
	{
		e.stopPropagation();
		props.onDeleteSearch?.(id);
	};

	return (
		<div class={clsx('border-b border-slate-700/50', props.class)}>
			{/* Header */}
			<button
				type="button"
				class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/30 transition-colors"
				onClick={props.onToggleExpand}
			>
				<div class="flex items-center gap-2">
					<NavigatorIcon
						name={props.expanded ? 'chevronDown' : 'chevronRight'}
						size="sm"
						class="text-slate-400"
					/>
					<NavigatorIcon name="bookmark" size="sm" class="text-amber-400"/>
					<span class="text-sm font-medium text-slate-300">{t(keys.SAVED_SEARCHES_TITLE)}</span>
					<Show when={props.searches.length > 0}>
						<span class="text-xs text-slate-500">({props.searches.length})</span>
					</Show>
				</div>
				<button
					type="button"
					class="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
					onClick={(e) =>
					{
						e.stopPropagation();
						props.onSaveCurrentSearch?.();
					}}
					title={t(keys.SAVED_SEARCHES_ADD)}
				>
					<NavigatorIcon name="plus" size="sm"/>
				</button>
			</button>

			{/* Content */}
			<Show when={props.expanded}>
				<div class="px-2 pb-2">
					{/* Loading */}
					<Show when={props.loading}>
						<div class="flex items-center justify-center py-4 text-slate-500 text-sm">
							<NavigatorIcon name="loading" size="sm" class="animate-spin mr-2"/>
							Loading...
						</div>
					</Show>

					{/* Empty state */}
					<Show when={!props.loading && props.searches.length === 0}>
						<div class="text-center py-4 px-2">
							<p class="text-sm text-slate-500">{t(keys.SAVED_SEARCHES_EMPTY)}</p>
							<p class="text-xs text-slate-600 mt-1">
								{t(keys.SAVED_SEARCHES_ADD)}
							</p>
						</div>
					</Show>

					{/* Saved searches list */}
					<Show when={!props.loading && props.searches.length > 0}>
						<div class="space-y-1">
							<For each={props.searches}>
								{(search) => (
									<div
										class={clsx(
											'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
											'hover:bg-slate-700/40 group'
										)}
										onClick={() => handleSearchClick(search)}
										onMouseEnter={() => setHoveredId(search.id)}
										onMouseLeave={() => setHoveredId(null)}
									>
										<NavigatorIcon name="search" size="sm" class="text-slate-500"/>
										<span class="flex-1 text-sm text-slate-300 truncate">
											{search.localization || search.filter || search.searchCode}
										</span>
										<Show when={hoveredId() === search.id}>
											<button
												type="button"
												class="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
												onClick={(e) => handleDelete(e, search.id)}
												title="Delete saved search"
											>
												<NavigatorIcon name="close" size="xs"/>
											</button>
										</Show>
									</div>
								)}
							</For>
						</div>
					</Show>
				</div>
			</Show>
		</div>
	);
}
