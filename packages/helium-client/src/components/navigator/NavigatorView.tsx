import {createEffect, createSignal, For, JSX, Show} from 'solid-js';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardView} from '@ui/common/card';
import {SearchView} from './views/search/SearchView';
import {BlockResultsView} from './views/search/results/BlockResultsView';
import {QuickLinksView} from './views/QuickLinksView';
import {LiftView} from './views/LiftView';
import {DoorStateView} from './views/DoorStateView';
import {RoomCreatorView} from './views/RoomCreatorView';
import {NavigatorRoomInfoView} from './views/NavigatorRoomInfoView';
import {RoomLinkView} from './views/RoomLinkView';

import backIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_button_back.png';
import refreshIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_refresh_search_icon.png';
import createRoomIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_create_room.png';
import randomRoomIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_random_room.png';
import quickLinkAddIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_button_quicklink_add.png';

/**
 * NavigatorView - Main navigator window container.
 *
 * Two-pane layout: left pane (quick links) + right pane (tabs + search + results).
 *
 * @see source_as_win63/habbo/navigator/view/NavigatorView.as
 */
export function NavigatorView(): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const [isLoading, setIsLoading] = createSignal(false);
	const [hasInitialSearch, setHasInitialSearch] = createSignal(false);
	const [leftPaneVisible, setLeftPaneVisible] = createSignal(true);

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

	const handleRefresh = () =>
	{
		actions.performLastSearch();
		setIsLoading(true);
	};

	const handleRandomRoom = () =>
	{
		actions.search('hotel_view', '');
		setIsLoading(true);
	};

	const toggleLeftPane = () =>
	{
		setLeftPaneVisible(v => !v);
	};

	return (
		<>
			<Show when={nav.isVisible}>
				<HeliumCardView
					uniqueKey="navigator"
					class={`helium-navigator${leftPaneVisible() ? '' : ' left-pane-hidden'}`}
				>
					<HeliumCardHeaderView
						title={t(nav.isCreatorOpen ? 'navigator.createroom.title' : 'navigator.title', nav.isCreatorOpen ? 'Create Room' : 'Navigator')}
						onClose={() => actions.close()}
					/>

					<HeliumCardContentView position="relative" overflow="hidden">
						{/* Loading overlay */}
						<Show when={isLoading()}>
							<div class="navigator-loading-mask" />
						</Show>

						<Show
							when={!nav.isCreatorOpen}
							fallback={<RoomCreatorView />}
						>
							<div class="navigator-body">
								{/* Toggle left pane button */}
								<div
									class="toggle-left-pane-btn"
									onClick={toggleLeftPane}
									title={t('navigator.tooltip.left.show.hide', 'Toggle quick links')}
								>
									<img src={quickLinkAddIcon} alt="" />
								</div>

								{/* Left pane - Quick Links */}
								<div class="navigator-left-pane">
									<div class="left-pane-title" onClick={toggleLeftPane}>
										<img src={quickLinkAddIcon} alt="" />
										{t('navigator.quicklinks.title', 'Quick Links')}
									</div>
									<div class="left-pane-links">
										<QuickLinksView />
									</div>
									<div class="left-pane-add-btn" title={t('navigator.quicklink.add', 'Add quick link')}>
										<img src={quickLinkAddIcon} alt="" />
									</div>
								</div>

								{/* Right pane - Tabs + Search + Results + Bottom buttons */}
								<div class="navigator-right-pane">
									{/* Tabs */}
									<div class="navigator-tabs">
										<For each={nav.topLevelContexts}>
											{(ctx) => (
												<div
													class={`navigator-tab${nav.currentSearchCode === ctx.searchCode ? ' active' : ''}`}
													onClick={() =>
													{
														actions.closeCreator();
														actions.search(ctx.searchCode, '');
														setIsLoading(true);
													}}
												>
													{t('navigator.toplevelview.' + ctx.searchCode, ctx.searchCode)}
												</div>
											)}
										</For>
									</div>

									{/* Navigation bar: back + search + refresh */}
									<div class="navigator-nav-bar">
										<button
											class="nav-btn"
											disabled={!nav.searchResult}
											onClick={handleBack}
											title={t('navigator.back', 'Back')}
										>
											<img src={backIcon} alt="" />
										</button>

										<SearchView onSearch={handleSearch} />

										<button
											class="nav-btn"
											onClick={handleRefresh}
											title={t('navigator.refresh', 'Refresh')}
										>
											<img src={refreshIcon} alt="" />
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

									{/* Bottom buttons: Create Room / Random Room */}
									<div class="navigator-bottom-buttons">
										<img
											class="bottom-btn"
											src={createRoomIcon}
											alt={t('navigator.createroom.title', 'Create Room')}
											onClick={() => actions.openCreator()}
											title={t('navigator.createroom.title', 'Create Room')}
										/>
										<img
											class="bottom-btn"
											src={randomRoomIcon}
											alt={t('navigator.randomroom', 'Random Room')}
											onClick={handleRandomRoom}
											title={t('navigator.randomroom', 'Random Room')}
										/>
									</div>
								</div>
							</div>
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
