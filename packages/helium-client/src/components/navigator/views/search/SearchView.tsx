import type {JSX} from 'solid-js';
import {createEffect, createSignal, For, Show} from 'solid-js';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';

import penIcon from '@/assets/images/HabboWindowManagerCom_common_small_pen.png';
import closeIcon from '@/assets/images/HabboWindowManagerCom_icons_close.png';
import refreshIcon from '@/assets/images/HabboWindowManagerCom_newnavigator_refresh_search_icon.png';

/**
 * Search filter options
 *
 * @see source_as_win63/habbo/navigator/view/search/SearchView.as - FILTER_SELECTOR_INDEX_TO_MODE
 */
const SEARCH_FILTERS = [
	{name: 'anything', query: ''},
	{name: 'room.name', query: 'roomname'},
	{name: 'owner', query: 'owner'},
	{name: 'tag', query: 'tag'},
	{name: 'group', query: 'group'},
] as const;

export interface SearchViewProps
{
	onSearch?: () => void;
	onRefresh?: () => void;
}

/**
 * SearchView - Search input with filter dropdown, clear/pen icon, and refresh button.
 *
 * No "Go" button — search is triggered by pressing Enter.
 * Refresh button only visible when input has real text.
 * Icon: pen when empty, close X when has text.
 *
 * @see source_as_win63/habbo/navigator/view/search/SearchView.as
 */
export function SearchView(props: SearchViewProps): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const [filterIndex, setFilterIndex] = createSignal(0);
	const [inputText, setInputText] = createSignal('');

	let inputRef: HTMLInputElement | undefined;

	/**
	 * Whether the input has real (non-placeholder) text.
	 * Controls refresh visibility and icon state.
	 * @see SearchView.as line 100: caption.length != 0 && caption != placeholder
	 */
	const hasText = () => inputText().length > 0;

	/**
	 * Build the formatted search string: "prefix:text" or just "text"
	 * @see SearchView.as getFilterParameter
	 */
	const buildSearchString = (): string =>
	{
		const filter = SEARCH_FILTERS[filterIndex()] ?? SEARCH_FILTERS[0];
		const text = inputText().trim();

		if (filter.query && text)
		{
			return filter.query + ':' + text;
		}

		return text;
	};

	const processSearch = () =>
	{
		const code = nav.currentSearchCode || nav.topLevelContexts[0]?.searchCode || 'official_view';

		actions.search(code, buildSearchString());
		props.onSearch?.();
	};

	/**
	 * Clear the search input and reset icon to pen.
	 * @see SearchView.as onClearSearch
	 */
	const clearInput = () =>
	{
		setInputText('');
		inputRef?.focus();

		const code = nav.currentSearchCode || nav.topLevelContexts[0]?.searchCode || 'official_view';

		actions.search(code, '');
	};

	/**
	 * Handle icon click: if text → clear, if empty → focus input.
	 * @see SearchView.as onClearSearch (clears + sets pen icon)
	 */
	const handleIconClick = () =>
	{
		if (hasText())
		{
			clearInput();
		}
		else
		{
			inputRef?.focus();
		}
	};

	const handleKeyDown = (e: KeyboardEvent) =>
	{
		if (e.key === 'Enter')
		{
			processSearch();
		}
	};

	// Sync with incoming search results
	createEffect(() =>
	{
		const result = nav.searchResult;

		if (!result) return;

		const data = result.filteringData;

		if (!data)
		{
			setFilterIndex(0);
			setInputText('');
			return;
		}

		const colonIdx = data.indexOf(':');

		if (colonIdx > 0)
		{
			const prefix = data.substring(0, colonIdx);
			const idx = SEARCH_FILTERS.findIndex(f => f.query === prefix);

			if (idx >= 0)
			{
				setFilterIndex(idx);
				setInputText(data.substring(colonIdx + 1));
				return;
			}
		}

		setFilterIndex(0);
		setInputText(data);
	});

	return (
		<div class="navigator-search">
			<select
				class="search-filter-dropdown"
				value={filterIndex()}
				onChange={(e) => setFilterIndex(parseInt(e.currentTarget.value))}
			>
				<For each={SEARCH_FILTERS}>
					{(filter, index) => (
						<option value={index()}>
							{t('navigator.filter.' + filter.name, filter.name)}
						</option>
					)}
				</For>
			</select>
			<div class="search-input-wrapper">
				<input
					type="text"
					class="search-input"
					ref={inputRef}
					placeholder={t('navigator.filter.input.placeholder', 'filter rooms by...')}
					value={inputText()}
					onInput={(e) => setInputText(e.currentTarget.value)}
					onKeyDown={handleKeyDown}
				/>
				<span class="search-icon" onClick={handleIconClick}>
					<img src={hasText() ? closeIcon : penIcon} alt="" />
				</span>
			</div>
			<Show when={hasText()}>
				<button
					class="search-refresh-btn"
					onClick={() => props.onRefresh?.()}
					title={t('navigator.refresh', 'Refresh')}
				>
					<img src={refreshIcon} alt="" />
				</button>
			</Show>
		</div>
	);
}
