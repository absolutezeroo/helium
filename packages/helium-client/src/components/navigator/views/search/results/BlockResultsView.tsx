import type {JSX} from 'solid-js';
import {createSignal, createEffect, For, Show} from 'solid-js';
import {FaSolidChevronDown, FaSolidChevronRight, FaSolidBars, FaSolidTableCells, FaSolidArrowLeft, FaSolidBookmark} from 'solid-icons/fa';
import type {NavigatorSearchResultBlock} from '@habbo/communication/messages/incoming/newnavigator/NavigatorSearchResultBlock';
import {NavigatorSearchAction} from '@habbo/communication/messages/incoming/newnavigator/NavigatorSearchResultBlock';
import {ResultsModeEnum} from '@habbo/navigator/view/ResultsModeEnum';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';
import {RoomEntryRow} from './RoomEntryRow';
import {RoomEntryTile} from './RoomEntryTile';

export interface BlockResultsViewProps
{
	block: NavigatorSearchResultBlock;
}

/**
 * BlockResultsView - A single category block in the search results.
 *
 * Renders a collapsible header + room entries in either row or tile mode.
 * Faithfully ports the CategoryElementFactory + BlockResultsView behavior.
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/search/results/BlockResultsView.as
 * @see source_as_flash/com/sulake/habbo/navigator/view/search/results/CategoryElementFactory.as
 */
export function BlockResultsView(props: BlockResultsViewProps): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const [isCollapsed, setIsCollapsed] = createSignal(false);
	const [viewMode, setViewMode] = createSignal<number>(ResultsModeEnum.ROWS);

	// Sync collapsed/viewMode with server state
	createEffect(() =>
	{
		const block = props.block;

		if (!block) return;

		setIsCollapsed(block.forceClosed || nav.collapsedCategories.includes(block.searchCode));
		setViewMode(block.viewMode);
	});

	const getTitle = (): string =>
	{
		const code = props.block.searchCode;

		if (!code || !code.length)
		{
			return props.block.text || '';
		}

		const locKey = 'navigator.searchcode.title.' + code;
		const localized = t(locKey, '');

		if (localized && localized !== locKey)
		{
			return localized;
		}

		return props.block.text || code;
	};

	const toggleCollapse = () =>
	{
		const code = props.block.searchCode;
		const next = !isCollapsed();

		setIsCollapsed(next);

		if (next)
		{
			actions.addCollapsedCategory(code);
		}
		else
		{
			actions.removeCollapsedCategory(code);
		}
	};

	/**
	 * Toggle view mode and persist to server
	 * @see BlockResultsView.as _Str_20474
	 */
	const toggleViewMode = () =>
	{
		const current = viewMode();
		const next = current === ResultsModeEnum.ROWS ? ResultsModeEnum.TILES : ResultsModeEnum.ROWS;

		setViewMode(next);
		props.block.viewMode = next;
		actions.setViewMode(props.block.searchCode, next);
	};

	/**
	 * Handle "show more" / "go back" actions
	 * @see BlockResultsView.as _Str_19195
	 */
	const handleAction = () =>
	{
		const action = props.block.actionAllowed;

		if (action === NavigatorSearchAction.GO_BACK)
		{
			actions.search(props.block.searchCode, '');
		}
		else if (action === NavigatorSearchAction.CAN_EXPAND)
		{
			actions.search(props.block.searchCode, '');
		}
	};

	const handleAddQuickLink = () =>
	{
		const result = nav.searchResult;

		if (result)
		{
			actions.addSavedSearch(props.block.searchCode, result.filteringData);
		}
	};

	const isTileMode = () => viewMode() === ResultsModeEnum.TILES;

	return (
		<div class="navigator-category">
			{/* Category header */}
			<div class="navigator-category-header">
				<div class="category-title" onClick={toggleCollapse}>
					<Show when={!isCollapsed()} fallback={<FaSolidChevronRight class="collapse-icon" />}>
						<FaSolidChevronDown class="collapse-icon" />
					</Show>
					<span class="category-name">{getTitle()}</span>
				</div>
				<div class="category-controls">
					{/* View mode toggle */}
					<Show when={!isCollapsed()}>
						<Show when={!isTileMode()}>
							<FaSolidTableCells
								class="control-icon"
								onClick={toggleViewMode}
								title={t('navigator.display.mode.tiles', 'Tiles')}
							/>
						</Show>
						<Show when={isTileMode()}>
							<FaSolidBars
								class="control-icon"
								onClick={toggleViewMode}
								title={t('navigator.display.mode.list', 'List')}
							/>
						</Show>
					</Show>
					{/* Go back button */}
					<Show when={props.block.actionAllowed === NavigatorSearchAction.GO_BACK}>
						<FaSolidArrowLeft
							class="control-icon"
							onClick={handleAction}
							title={t('navigator.showmore.back', 'Back')}
						/>
					</Show>
					{/* Expand button */}
					<Show when={props.block.actionAllowed === NavigatorSearchAction.CAN_EXPAND}>
						<span class="show-more-text" onClick={handleAction}>
							{t('navigator.showmore', 'Show More')}
						</span>
					</Show>
					{/* Quick link button */}
					<FaSolidBookmark
						class="control-icon"
						onClick={handleAddQuickLink}
						title={t('navigator.quicklink.add', 'Save search')}
					/>
				</div>
			</div>

			{/* Room entries */}
			<Show when={!isCollapsed()}>
				<Show
					when={props.block.guestRooms.length > 0}
					fallback={
						<div class="navigator-empty">
							{t('navigator.results.empty', 'No rooms found.')}
						</div>
					}
				>
					<Show
						when={isTileMode()}
						fallback={
							<div class="navigator-rows">
								<For each={props.block.guestRooms}>
									{(room) => (
										<RoomEntryRow roomData={room} />
									)}
								</For>
							</div>
						}
					>
						<div class="navigator-tiles">
							<For each={props.block.guestRooms}>
								{(room) => (
									<RoomEntryTile roomData={room} />
								)}
							</For>
						</div>
					</Show>
				</Show>
			</Show>
		</div>
	);
}
