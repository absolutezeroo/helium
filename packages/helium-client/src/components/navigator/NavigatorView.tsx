import {createEffect, createSignal, For, JSX, Show} from 'solid-js';
import {FaSolidPlus, FaSolidArrowLeft, FaSolidArrowRight, FaSolidRotateRight} from 'solid-icons/fa';
import clsx from 'clsx';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardView} from '@ui/common/card';
import {TopViewSelector} from './views/TopViewSelector';
import {SearchView} from './views/search/SearchView';
import {BlockResultsView} from './views/search/results/BlockResultsView';
import {QuickLinksView} from './views/QuickLinksView';
import {LiftView} from './views/LiftView';
import {DoorStateView} from './views/DoorStateView';
import {RoomCreatorView} from './views/RoomCreatorView';
import {NavigatorRoomInfoView} from './views/NavigatorRoomInfoView';
import {RoomLinkView} from './views/RoomLinkView';

/**
 * NavigatorView - Main navigator window container.
 *
 * Lifecycle:
 * 1. Open → sends NewNavigatorInitComposer on first open
 * 2. When isReady and no results → auto-search first context (official_view)
 * 3. TopViewSelector tabs + SearchView + BlockResultsView for results
 * 4. Back/forward navigation via history manager
 * 5. QuickLinksView for saved searches
 * 6. Create room panel toggle
 *
 * @see source_as_win63/habbo/navigator/view/NavigatorView.as
 */
export function NavigatorView(): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const [isLoading, setIsLoading] = createSignal(false);
	const [hasInitialSearch, setHasInitialSearch] = createSignal(false);

	let resultsRef: HTMLDivElement | undefined;

	// When results arrive, clear loading and scroll to top
	createEffect(() =>
	{
		const result = nav.searchResult;

		if (!result) return;

		setIsLoading(false);

		if (resultsRef) resultsRef.scrollTop = 0;
	});

	// Auto-search on first ready: when isReady and no results yet
	createEffect(() =>
	{
		if (!nav.isVisible || !nav.isReady || hasInitialSearch()) return;

		if (!nav.searchResult && nav.topLevelContexts.length > 0)
		{
			const firstCode = nav.topLevelContexts[0].searchCode;

			actions.search(firstCode, '');
			setIsLoading(true);
			setHasInitialSearch(true);
		}
	});

	const handleSearch = () =>
	{
		setIsLoading(true);
	};

	const handleBack = () =>
	{
		actions.goBack();
		setIsLoading(true);
	};

	const handleForward = () =>
	{
		actions.goForward();
		setIsLoading(true);
	};

	const handleRefresh = () =>
	{
		actions.performLastSearch();
		setIsLoading(true);
	};

	return (
		<>
			<Show when={nav.isVisible}>
				<HeliumCardView uniqueKey="navigator" class="helium-navigator">
					<HeliumCardHeaderView
						title={t(nav.isCreatorOpen ? 'navigator.createroom.title' : 'navigator.title', nav.isCreatorOpen ? 'Create Room' : 'Navigator')}
						onClose={() => actions.close()}
					/>

					{/* Tabs */}
					<Show when={!nav.isCreatorOpen}>
						<div class="container-fluid helium-card-tabs d-flex justify-content-center align-items-center gap-1 pt-1">
							<For each={nav.topLevelContexts}>
								{(ctx) => (
									<div
										class={clsx(
											'nav-item rounded-top border cursor-pointer overflow-hidden position-relative',
											nav.currentSearchCode === ctx.searchCode && 'active'
										)}
										onClick={() =>
										{
											actions.closeCreator();
											actions.search(ctx.searchCode, '');
											setIsLoading(true);
										}}
									>
										<div class="d-flex flex-shrink-1 justify-content-center align-items-center">
											{t('navigator.toplevelview.' + ctx.searchCode, ctx.searchCode)}
										</div>
									</div>
								)}
							</For>
							{/* Create room tab */}
							<div
								class={clsx(
									'nav-item rounded-top border cursor-pointer overflow-hidden position-relative',
									nav.isCreatorOpen && 'active'
								)}
								onClick={() => actions.openCreator()}
							>
								<div class="d-flex flex-shrink-1 justify-content-center align-items-center">
									<FaSolidPlus />
								</div>
							</div>
						</div>
					</Show>

					{/* Content */}
					<HeliumCardContentView position="relative">
						{/* Loading overlay */}
						<Show when={isLoading()}>
							<div class="navigator-loading-mask" />
						</Show>

						<Show
							when={!nav.isCreatorOpen}
							fallback={<RoomCreatorView />}
						>
							{/* Navigation bar: back/forward + search + refresh */}
							<div class="navigator-nav-bar">
								{/* Back/Forward */}
								<button
									class="nav-btn"
									disabled={!nav.searchResult}
									onClick={handleBack}
									title={t('navigator.back', 'Back')}
								>
									<FaSolidArrowLeft />
								</button>
								<button
									class="nav-btn"
									disabled={!nav.searchResult}
									onClick={handleForward}
									title={t('navigator.forward', 'Forward')}
								>
									<FaSolidArrowRight />
								</button>

								{/* Search */}
								<SearchView onSearch={handleSearch} />

								{/* Refresh */}
								<button
									class="nav-btn refresh-btn"
									onClick={handleRefresh}
									title={t('navigator.refresh', 'Refresh')}
								>
									<FaSolidRotateRight />
								</button>
							</div>

							{/* Lifted rooms carousel */}
							<LiftView />

							{/* Results */}
							<div
								class="navigator-results"
								ref={resultsRef}
							>
								<Show when={nav.searchResult}>
									<For each={nav.searchResult!.blocks}>
										{(block) => (
											<BlockResultsView block={block} />
										)}
									</For>
								</Show>
							</div>

							{/* Saved searches (quick links) */}
							<QuickLinksView />
						</Show>
					</HeliumCardContentView>
				</HeliumCardView>
			</Show>

			{/* Modal dialogs */}
			<DoorStateView />
			<NavigatorRoomInfoView />
			<RoomLinkView />
		</>
	);
}
