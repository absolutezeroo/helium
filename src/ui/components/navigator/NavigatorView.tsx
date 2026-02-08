import type {JSX} from 'solid-js';
import {createEffect, createSignal, For, Show} from 'solid-js';
import clsx from 'clsx';
import {FaSolidPlus} from 'solid-icons/fa';
import {navigatorStore} from '@ui/stores/navigatorStore';
import {useLocalization} from '@ui/common';
import {HeliumCardContentView, HeliumCardHeaderView, HeliumCardTabsView, HeliumCardView} from '@ui/common/card';
import {NavigatorSearchView} from './views/search/NavigatorSearchView';
import {NavigatorSearchResultView} from './views/search/NavigatorSearchResultView';
import {NavigatorDoorStateView} from './views/NavigatorDoorStateView';
import {NavigatorRoomCreatorView} from './views/NavigatorRoomCreatorView';
import {NavigatorRoomInfoView} from './views/NavigatorRoomInfoView';
import {NavigatorRoomLinkView} from './views/NavigatorRoomLinkView';

/**
 * NavigatorView - Main navigator window (Nitro-style).
 *
 * @see source_nitro_react/components/navigator/NavigatorView.tsx
 */
export function NavigatorView(): JSX.Element
{
	const t = useLocalization();
	const {state: navigator, actions: navActions} = navigatorStore;

	const [isCreatorOpen, setCreatorOpen] = createSignal(false);
	const [isLoading, setIsLoading] = createSignal(false);

	let resultsRef: HTMLDivElement | undefined;

	const topLevelContexts = () => navigator.topLevelContexts;
	const searchResults = () => navigator.searchResults;
	const currentSearchCode = () => navigator.currentSearchCode;

	const sendSearch = (searchValue: string, contextCode: string) =>
	{
		setCreatorOpen(false);
		navActions.search(contextCode, searchValue);
		setIsLoading(true);
	};

	// When search results arrive, clear loading and scroll to top
	createEffect(() =>
	{
		const results = searchResults();

		if (!results) return;

		setIsLoading(false);

		if (resultsRef) resultsRef.scrollTop = 0;
	});

	return (
		<>
			<Show when={navigator.isOpen}>
				<HeliumCardView uniqueKey="navigator" class="helium-navigator">
					<HeliumCardHeaderView
						title={t(isCreatorOpen() ? 'navigator.createroom.title' : 'navigator.title', isCreatorOpen() ? 'Create Room' : 'Navigator')}
						onClose={() => navActions.close()}
					/>

					{/* Tabs */}
					<HeliumCardTabsView>
						<For each={topLevelContexts()}>
							{(ctx) => (
								<div
									class={clsx(
										'nav-item rounded-top border cursor-pointer overflow-hidden position-relative',
										(currentSearchCode() === ctx.searchCode && !isCreatorOpen()) && 'active'
									)}
									onClick={() => sendSearch('', ctx.searchCode)}
								>
									<div class="d-flex flex-shrink-1 justify-content-center align-items-center">
										{t('navigator.toplevelview.' + ctx.searchCode, ctx.searchCode)}
									</div>
								</div>
							)}
						</For>
						<div
							class={clsx(
								'nav-item rounded-top border cursor-pointer overflow-hidden position-relative',
								isCreatorOpen() && 'active'
							)}
							onClick={() => setCreatorOpen(true)}
						>
							<div class="d-flex flex-shrink-1 justify-content-center align-items-center">
								<FaSolidPlus />
							</div>
						</div>
					</HeliumCardTabsView>

					{/* Content */}
					<HeliumCardContentView position="relative">
						{/* Loading overlay */}
						<Show when={isLoading()}>
							<div class="position-absolute top-0 start-0 w-100 h-100 z-index-1 bg-muted opacity-0-5" />
						</Show>

						<Show
							when={!isCreatorOpen()}
							fallback={<NavigatorRoomCreatorView />}
						>
							<NavigatorSearchView sendSearch={sendSearch} />
							<div
								class="d-flex flex-column overflow-auto"
								ref={resultsRef}
							>
								<Show when={searchResults()}>
									<For each={searchResults()!.blocks}>
										{(block) => (
											<NavigatorSearchResultView searchResult={block} />
										)}
									</For>
								</Show>
							</div>
						</Show>
					</HeliumCardContentView>
				</HeliumCardView>
			</Show>
			<NavigatorDoorStateView />
			<Show when={navigator.isRoomInfoOpen}>
				<NavigatorRoomInfoView onCloseClick={() => navActions.closeRoomInfo()} />
			</Show>
			<Show when={navigator.isRoomLinkOpen}>
				<NavigatorRoomLinkView onCloseClick={() => navActions.closeRoomLink()} />
			</Show>
		</>
	);
}
