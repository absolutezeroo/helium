import type {JSX} from 'solid-js';
import {createEffect, createSignal, For, Show} from 'solid-js';
import {FaSolidMinus, FaSolidPlus, FaSolidBars, FaSolidTableCells, FaSolidWindowMaximize, FaSolidWindowRestore} from 'solid-icons/fa';
import type {NavigatorSearchResultBlock} from '@habbo/communication/messages/incoming/newnavigator';
import {ModuleId, useActions, useModule} from '@ui/bridge';
import {useLocalization} from '@ui/common';
import {NavigatorSearchResultItemView} from './NavigatorSearchResultItemView';

/** Display mode constants matching Nitro */
const DISPLAY_MODE_LIST = 0;
const DISPLAY_MODE_THUMBNAILS = 2;

export interface NavigatorSearchResultViewProps
{
	searchResult: NavigatorSearchResultBlock;
}

/**
 * NavigatorSearchResultView - Collapsible search result section.
 *
 * @see source_nitro_react/components/navigator/views/search/NavigatorSearchResultView.tsx
 */
export function NavigatorSearchResultView(props: NavigatorSearchResultViewProps): JSX.Element
{
	const t = useLocalization();
	const {state: navigator} = useModule(ModuleId.Navigator);
	const navActions = useActions(ModuleId.Navigator);

	const [isExtended, setIsExtended] = createSignal(true);
	const [displayMode, setDisplayMode] = createSignal(0);

	// Sync with searchResult
	createEffect(() =>
	{
		const sr = props.searchResult;

		if (!sr) return;

		setIsExtended(!sr.forceClosed);
		setDisplayMode(sr.viewMode);
	});

	const getResultTitle = (): string =>
	{
		let name = props.searchResult.searchCode;

		if (!name || !name.length)
		{
			return props.searchResult.text || '';
		}

		const locKey = 'navigator.searchcode.title.' + name;
		const localized = t(locKey, locKey);

		if (localized === locKey)
		{
			return props.searchResult.text || name;
		}

		if (name.startsWith('${'))
		{
			return name.slice(2, name.length - 1);
		}

		return locKey;
	};

	const toggleDisplayMode = () =>
	{
		setDisplayMode(prev =>
			prev === DISPLAY_MODE_LIST ? DISPLAY_MODE_THUMBNAILS : DISPLAY_MODE_LIST
		);
	};

	const showMore = () =>
	{
		const sr = props.searchResult;

		if (sr.actionAllowed === 1)
		{
			navActions.search(sr.searchCode, '');
		}
		else if (sr.actionAllowed === 2)
		{
			const contexts = navigator().topLevelContexts;
			const code = navigator().currentSearchCode;
			const ctx = contexts.find(c => c.searchCode === code);

			if (ctx)
			{
				navActions.search(ctx.searchCode, '');
			}
		}
	};

	const isThumbnailMode = () => displayMode() >= DISPLAY_MODE_THUMBNAILS;

	return (
		<div class="d-flex flex-column bg-white rounded border border-muted gap-0">
			{/* Section header */}
			<div class="d-flex w-100 align-items-center justify-content-between px-2 py-1">
				<div
					class="d-flex flex-grow-1 cursor-pointer align-items-center gap-1"
					onClick={() => setIsExtended(prev => !prev)}
				>
					<Show when={isExtended()} fallback={<FaSolidPlus class="text-secondary" />}>
						<FaSolidMinus class="text-secondary" />
					</Show>
					<span>{t(getResultTitle(), getResultTitle())}</span>
				</div>
				<div class="d-flex gap-2">
					<Show when={displayMode() === DISPLAY_MODE_LIST}>
						<FaSolidTableCells class="text-secondary cursor-pointer" onClick={toggleDisplayMode} />
					</Show>
					<Show when={displayMode() >= DISPLAY_MODE_THUMBNAILS}>
						<FaSolidBars class="text-secondary cursor-pointer" onClick={toggleDisplayMode} />
					</Show>
					<Show when={props.searchResult.actionAllowed > 0 && props.searchResult.actionAllowed === 1}>
						<FaSolidWindowMaximize class="text-secondary cursor-pointer" onClick={showMore} />
					</Show>
					<Show when={props.searchResult.actionAllowed > 0 && props.searchResult.actionAllowed !== 1}>
						<FaSolidWindowRestore class="text-secondary cursor-pointer" onClick={showMore} />
					</Show>
				</div>
			</div>

			{/* Room items */}
			<Show when={isExtended()}>
				<Show
					when={isThumbnailMode()}
					fallback={
						<div class="navigator-grid" style={{'display': 'grid', 'grid-template-columns': '1fr', 'gap': '0'}}>
							<For each={props.searchResult.guestRooms}>
								{(room) => (
									<NavigatorSearchResultItemView
										roomData={room}
										thumbnail={false}
									/>
								)}
							</For>
						</div>
					}
				>
					<div class="mx-2" style={{'display': 'grid', 'grid-template-columns': 'repeat(3, 1fr)', 'gap': '4px', 'min-height': '130px'}}>
						<For each={props.searchResult.guestRooms}>
							{(room) => (
								<NavigatorSearchResultItemView
									roomData={room}
									thumbnail={true}
								/>
							)}
						</For>
					</div>
				</Show>
			</Show>
		</div>
	);
}
