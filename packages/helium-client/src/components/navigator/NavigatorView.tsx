import {createEffect, createSignal, For, JSX, onCleanup, Show} from 'solid-js';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';
import {WindowFrame, WindowHeader, WindowContent} from '@ui/common/window';
import {SearchView} from './views/search/SearchView';
import {BlockResultsView} from './views/search/results/BlockResultsView';
import {QuickLinksView} from './views/QuickLinksView';
import {LiftView} from './views/LiftView';
import {DoorStateView} from './views/DoorStateView';
import {RoomCreatorView} from './views/RoomCreatorView';
import {NavigatorRoomInfoView} from './views/NavigatorRoomInfoView';
import {RoomLinkView} from './views/RoomLinkView';

import backIcon from '@/assets/images/newnavigator_button_back.png';
import createRoomIcon from '@/assets/images/newnavigator_create_room.png';
import randomRoomIcon from '@/assets/images/newnavigator_random_room.png';
import quickLinkAddIcon from '@/assets/images/newnavigator_button_quicklink_add.png';
import leftPaneHideIcon from '@/assets/images/newnavigator_button_leftpane_hide.png';
import leftPaneShowIcon from '@/assets/images/newnavigator_button_leftpane_show.png';

/**
 * NavigatorView - Main navigator window container.
 *
 * Two-pane layout: left pane (quick links) + right pane (tabs + search + results).
 * Left pane starts HIDDEN by default per AS3: setLeftPaneVisibility(false)
 *
 * @see source_as_win63/habbo/navigator/view/NavigatorView.as
 */
export function NavigatorView(): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const [isLoading, setIsLoading] = createSignal(false);
	const [hasInitialSearch, setHasInitialSearch] = createSignal(false);

	// Left pane starts HIDDEN per AS3 NavigatorView.as line 365: setLeftPaneVisibility(false)
	const [leftPaneVisible, setLeftPaneVisible] = createSignal(false);

	let resultsRef: HTMLDivElement | undefined;

	// When results arrive, clear loading and scroll to top
	createEffect(() =>
	{
		const result = nav.searchResult;

		if (!result) return;

		setIsLoading(false);

		if (resultsRef) resultsRef.scrollTop = 0;
	});

	// Timeout safety: if loading lasts > 5s, disable it
	createEffect(() =>
	{
		if(!isLoading()) return;

		const timer = setTimeout(() => setIsLoading(false), 5000);

		onCleanup(() => clearTimeout(timer));
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

	/**
	 * Toggle left pane visibility.
	 * @see NavigatorView.as leftPaneShowHideProcedure
	 */
	const toggleLeftPane = () =>
	{
		setLeftPaneVisible(v => !v);
	};

	return (
		<>
			<Show when={nav.isVisible}>
				<WindowFrame
					uniqueKey="navigator"
					title={t(nav.isCreatorOpen ? 'navigator.createroom.title' : 'navigator.title', nav.isCreatorOpen ? 'Create Room' : 'Navigator')}
					width={leftPaneVisible() ? 578 : 425}
					height={535}
					class={`helium-navigator${leftPaneVisible() ? '' : ' left-pane-hidden'}`}
					onClose={() => actions.close()}
				>
					<WindowHeader
						title={t(nav.isCreatorOpen ? 'navigator.createroom.title' : 'navigator.title', nav.isCreatorOpen ? 'Create Room' : 'Navigator')}
						onClose={() => actions.close()}
					/>

					<WindowContent class="navigator-content" overflow="hidden">
						{/* Loading overlay */}
						<Show when={isLoading()}>
							<div class="navigator-loading-mask" />
						</Show>

						<Show
							when={!nav.isCreatorOpen}
							fallback={<RoomCreatorView />}
						>
							<div class="navigator-body">
								{/* Left pane - Quick Links
							    XML: itemlist_vertical x=6 y=35 w=149 h=440
							    quicklinks_border style="2" = white bg with border */}
								<div class="navigator-left-pane">
									<div class="left-pane-content">
										<div class="left-pane-title">
											<img src={quickLinkAddIcon} alt="" />
											{t('navigator.quick.links.title', 'Quick Links')}
										</div>
										<div class="left-pane-links">
											<QuickLinksView />
										</div>
									</div>
								</div>

								{/* Right pane - Tabs + Search + Results + Bottom buttons */}
								<div class="navigator-right-pane">
									{/* Tabs */}
									<div class="navigator-tabs">
										{/* Toggle left pane button (show/hide)
										    @see NavigatorView.as: left_hide_container / left_show_container */}
										<div
											class="toggle-left-pane-btn"
											onClick={toggleLeftPane}
											title={t('navigator.tooltip.left.show.hide', 'Toggle quick links')}
										>
											<img src={leftPaneVisible() ? leftPaneHideIcon : leftPaneShowIcon} alt="" />
										</div>

										<For each={nav.topLevelContexts}>
											{(ctx) => (
												<div
													class={`navigator-tab${nav.currentSearchCode === ctx.searchCode ? ' active' : ''}`}
													onClick={() =>
													{
														if(nav.currentSearchCode === ctx.searchCode) return;

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

									{/* Navigation bar: back + search (+ refresh inside SearchView) */}
									<div class="navigator-nav-bar">
										<button
											class="nav-btn"
											disabled={!nav.searchResult}
											onClick={handleBack}
											title={t('navigator.back', 'Back')}
										>
											<img src={backIcon} alt="" />
										</button>

										<SearchView onSearch={handleSearch} onRefresh={handleRefresh} />
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

									{/* Bottom buttons: Create Room / Random Room
								    XML: create_room_border x=0 y=395 w=189 h=60
								         random_room_border x=205 y=395 w=189 h=60
								    Each: image + white text overlay at x=60 y=22 w=125 */}
									<div class="navigator-bottom-buttons">
										<div
											class="bottom-btn"
											onClick={() => actions.openCreator()}
											title={t('navigator.tooltip.create.room', 'Create Room')}
										>
											<img src={createRoomIcon} alt="" />
											<span class="bottom-btn-text">
												{t('navigator.create.room', 'Create Room')}
											</span>
										</div>
										<div
											class="bottom-btn"
											onClick={handleRandomRoom}
											title={t('navigator.tooltip.random.room', 'Random Room')}
										>
											<img src={randomRoomIcon} alt="" />
											<span class="bottom-btn-text">
												{t('navigator.random.room', 'Random Room')}
											</span>
										</div>
									</div>
								</div>
							</div>
						</Show>
					</WindowContent>
				</WindowFrame>
			</Show>

			{/* Modal dialogs */}
			<DoorStateView />
			<NavigatorRoomInfoView />
			<RoomLinkView />
		</>
	);
}
