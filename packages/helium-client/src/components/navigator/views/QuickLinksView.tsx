import type {JSX} from 'solid-js';
import {createSignal, For, Show} from 'solid-js';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';

import qlRemoveIcon from '@/assets/images/newnavigator_icon_ql_remove.png';

/**
 * QuickLinksView - Saved searches (quick links) panel.
 *
 * Shows the user's saved searches. Click to execute, hover to show delete button.
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/QuickLinksView.as
 */
export function QuickLinksView(): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const [hoveredId, setHoveredId] = createSignal<number | null>(null);

	const handleClick = (searchCode: string, filter: string) =>
	{
		actions.search(searchCode, filter);
	};

	const handleDelete = (e: MouseEvent, id: number) =>
	{
		e.stopPropagation();
		actions.deleteSavedSearch(id);
	};

	return (
		<div class="navigator-quick-links">
			<For each={nav.savedSearches}>
				{(search) =>
				{
					const label = () =>
					{
						if (search.localization)
						{
							const loc = t(search.localization, '');

							if (loc && loc !== search.localization) return loc;
						}

						const codeLoc = t('navigator.searchcode.title.' + search.searchCode, '');

						if (codeLoc) return codeLoc + (search.filter ? ': ' + search.filter : '');

						return search.searchCode + (search.filter ? ': ' + search.filter : '');
					};

					return (
						<div
							class="quick-link-item"
							onMouseEnter={() => setHoveredId(search.id)}
							onMouseLeave={() => setHoveredId(null)}
							onClick={() => handleClick(search.searchCode, search.filter)}
						>
							<span class="quick-link-name">{label()}</span>
							<Show when={hoveredId() === search.id}>
								<span
									class="quick-link-remove"
									onClick={(e) => handleDelete(e, search.id)}
								>
									<img src={qlRemoveIcon} alt="" />
								</span>
							</Show>
						</div>
					);
				}}
			</For>
		</div>
	);
}
