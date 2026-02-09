import type {JSX} from 'solid-js';
import {createEffect, createSignal, For, Show} from 'solid-js';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';

/**
 * Search filter options
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/search/SearchView.as - _filterSelector
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
}

/**
 * SearchView - Search input with filter dropdown.
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/search/SearchView.as
 */
export function SearchView(props: SearchViewProps): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const [filterIndex, setFilterIndex] = createSignal(0);
	const [inputText, setInputText] = createSignal('');

	/**
	 * Build the formatted search string: "prefix:text" or just "text"
	 * @see SearchView.as _Str_24862
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

	const clearInput = () =>
	{
		setInputText('');

		const code = nav.currentSearchCode || nav.topLevelContexts[0]?.searchCode || 'official_view';

		actions.search(code, '');
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
					placeholder={t('navigator.filter.input.placeholder', 'Search...')}
					value={inputText()}
					onInput={(e) => setInputText(e.currentTarget.value)}
					onKeyDown={handleKeyDown}
				/>
				<Show when={inputText().length > 0}>
					<span class="search-clear-btn" onClick={clearInput}>
						&times;
					</span>
				</Show>
			</div>
			<button class="search-go-btn" onClick={processSearch}>
				Go
			</button>
		</div>
	);
}
