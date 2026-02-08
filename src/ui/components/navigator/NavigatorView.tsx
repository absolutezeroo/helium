import type {JSX} from 'solid-js';
import {createMemo, createSignal, For, Show} from 'solid-js';
import clsx from 'clsx';
import {ModuleId, useActions, useModule} from '../../bridge';
import {useLocalization} from '@ui/common';
import {HeliumCardView} from '@ui/common/card';
import type {NavigatorBlockData, RoomListViewMode} from './views';
import {NavigatorSearchResultView} from './views';
import {mapSearchResultsToBlocks} from './utils';
import {FaSolidMagnifyingGlass, FaSolidGrip, FaSolidList, FaSolidPlus, FaSolidCompass} from 'solid-icons/fa';

/**
 * NavigatorView - Habbo classic navigator window.
 */
export function NavigatorView(): JSX.Element
{
	const t = useLocalization();
	const {state: navigator} = useModule(ModuleId.Navigator);
	const navActions = useActions(ModuleId.Navigator);
	const locActions = useActions(ModuleId.Localization);

	const [viewMode, setViewMode] = createSignal<RoomListViewMode>('cards');
	const [searchQuery, setSearchQuery] = createSignal('');

	const tabs = createMemo(() =>
		navigator().topLevelContexts.map(ctx =>
		{
			const locKey = `navigator.toplevelview.${ctx.searchCode}`;
			const fallback = ctx.searchCode.replace('_view', '').replace(/_/g, ' ');
			return {
				id: ctx.searchCode,
				label: locActions.get(locKey, fallback),
			};
		})
	);

	const blocks = createMemo((): NavigatorBlockData[] =>
		mapSearchResultsToBlocks(navigator().searchResults)
	);

	const isSearching = () => searchQuery().length > 0;

	const handleTabChange = (searchCode: string) =>
	{
		navActions.search(searchCode);
	};

	const handleSearchSubmit = (e: Event) =>
	{
		e.preventDefault();
		const query = searchQuery().trim();
		if (query) navActions.searchRooms(query);
	};

	const handleClearSearch = () =>
	{
		setSearchQuery('');
		handleTabChange(navigator().currentSearchCode);
	};

	const handleRoomClick = (roomId: number) =>
	{
		navActions.goToRoom(roomId);
	};

	return (
		<Show when={navigator().isOpen}>
			<HeliumCardView uniqueKey="navigator" width={420} height={520} class="navigator-window">
				{/* ---- Header ---- */}
				<div class="nav-header drag-handle">
					<span class="nav-header__title">Navigateur</span>
					<button
						class="nav-header__close"
						onClick={() => navActions.close()}
						title="Fermer"
					>
						X
					</button>
				</div>

				{/* ---- Tabs ---- */}
				<div class="nav-tabs">
					<For each={tabs()}>
						{(tab) => (
							<button
								class={clsx(
									'nav-tab',
									(navigator().currentSearchCode === tab.id && !isSearching()) && 'nav-tab--active'
								)}
								onClick={() => handleTabChange(tab.id)}
							>
								{tab.label}
							</button>
						)}
					</For>
				</div>

				{/* ---- Search + View mode ---- */}
				<form class="nav-search" onSubmit={handleSearchSubmit}>
					<input
						class="nav-search__input"
						type="text"
						placeholder="Recherche"
						value={searchQuery()}
						onInput={(e) => setSearchQuery(e.currentTarget.value)}
						onKeyDown={(e) => e.key === 'Escape' && handleClearSearch()}
					/>
					<button type="submit" class="nav-search__btn">
						<FaSolidMagnifyingGlass size={12} />
					</button>

					{/* View mode toggle */}
					<div class="nav-viewmode">
						<button
							type="button"
							class={clsx('nav-viewmode__btn', viewMode() === 'cards' && 'nav-viewmode__btn--active')}
							onClick={() => setViewMode('cards')}
							title="Grille"
						>
							<FaSolidGrip size={12} />
						</button>
						<button
							type="button"
							class={clsx('nav-viewmode__btn', viewMode() === 'compact' && 'nav-viewmode__btn--active')}
							onClick={() => setViewMode('compact')}
							title="Liste"
						>
							<FaSolidList size={12} />
						</button>
					</div>
				</form>

				{/* ---- Content ---- */}
				<div class="nav-content">
					<Show when={blocks().length === 0}>
						<div class="nav-empty">Aucun appart trouvé</div>
					</Show>

					<For each={blocks()}>
						{(block) => (
							<NavigatorSearchResultView
								block={block}
								displayMode={viewMode()}
								onRoomClick={handleRoomClick}
							/>
						)}
					</For>
				</div>

				{/* ---- Footer ---- */}
				<div class="nav-footer">
					<button class="nav-footer__btn" onClick={() => navActions.openCreateModal()}>
						<FaSolidPlus size={10} /> Crée un appart
					</button>
					<button class="nav-footer__btn">
						<FaSolidCompass size={10} /> Endroit nouveau
					</button>
				</div>
			</HeliumCardView>
		</Show>
	);
}
