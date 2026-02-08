import type {JSX} from 'solid-js';
import {createEffect, createSignal, For} from 'solid-js';
import {FaSolidMagnifyingGlass} from 'solid-icons/fa';
import {ModuleId, useModule} from '@ui/bridge';
import {useLocalization} from '@ui/common';

/**
 * Search filter options matching Nitro's SearchFilterOptions.
 * @see source_nitro_react/api/navigator/SearchFilterOptions.ts
 */
const SEARCH_FILTER_OPTIONS = [
	{name: 'anything', query: ''},
	{name: 'room.name', query: 'roomname'},
	{name: 'owner', query: 'owner'},
	{name: 'tag', query: 'tag'},
	{name: 'group', query: 'group'},
] as const;

export interface NavigatorSearchViewProps
{
	sendSearch: (searchValue: string, contextCode: string) => void;
}

/**
 * NavigatorSearchView - Filter dropdown + search input + button.
 *
 * @see source_nitro_react/components/navigator/views/search/NavigatorSearchView.tsx
 */
export function NavigatorSearchView(props: NavigatorSearchViewProps): JSX.Element
{
	const t = useLocalization();
	const {state: navigator} = useModule(ModuleId.Navigator);

	const [filterIndex, setFilterIndex] = createSignal(0);
	const [searchValue, setSearchValue] = createSignal('');

	const topLevelContext = () =>
	{
		const contexts = navigator().topLevelContexts;
		const code = navigator().currentSearchCode;

		return contexts.find(ctx => ctx.searchCode === code) ?? contexts[0] ?? null;
	};

	const processSearch = () =>
	{
		const ctx = topLevelContext();

		if (!ctx) return;

		const filter = SEARCH_FILTER_OPTIONS[filterIndex()] ?? SEARCH_FILTER_OPTIONS[0];
		const query = (filter.query ? (filter.query + ':') : '') + searchValue();

		props.sendSearch(query || '', ctx.searchCode);
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
		const results = navigator().searchResults;

		if (!results) return;

		const data = results.filteringData;
		const split = data.split(':');

		let matchedIndex = 0;
		let value = '';

		if (split.length >= 2)
		{
			const [query, ...rest] = split;

			const idx = SEARCH_FILTER_OPTIONS.findIndex(opt => opt.query === query);

			if (idx >= 0) matchedIndex = idx;

			value = rest.join(':');
		}
		else
		{
			value = data;
		}

		setFilterIndex(matchedIndex);
		setSearchValue(value);
	});

	return (
		<div class="d-flex w-100 gap-1">
			<div class="flex-shrink-1">
				<select
					class="form-select form-select-sm"
					value={filterIndex()}
					onChange={(e) => setFilterIndex(parseInt(e.currentTarget.value))}
				>
					<For each={SEARCH_FILTER_OPTIONS}>
						{(filter, index) => (
							<option value={index()}>
								{t('navigator.filter.' + filter.name, filter.name)}
							</option>
						)}
					</For>
				</select>
			</div>
			<div class="d-flex w-100 gap-1">
				<input
					type="text"
					class="form-control form-control-sm"
					placeholder={t('navigator.filter.input.placeholder', 'Search...')}
					value={searchValue()}
					onInput={(e) => setSearchValue(e.currentTarget.value)}
					onKeyDown={handleKeyDown}
				/>
				<button class="btn btn-primary btn-sm" onClick={processSearch}>
					<FaSolidMagnifyingGlass />
				</button>
			</div>
		</div>
	);
}
