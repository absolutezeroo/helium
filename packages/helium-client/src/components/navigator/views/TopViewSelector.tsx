import type {JSX} from 'solid-js';
import {For} from 'solid-js';
import clsx from 'clsx';
import {useNavigator} from '@ui/hooks/navigator/useNavigator';
import {useLocalization} from '@ui/common';

/**
 * TopViewSelector - Tab navigation for top-level navigator contexts.
 *
 * Each tab represents a server-defined search code (official_view, hotel_view, myworld_view, etc.).
 * Clicking a tab triggers a search with that code.
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/TopViewSelector.as
 */
export function TopViewSelector(): JSX.Element
{
	const t = useLocalization();
	const {state: nav, actions} = useNavigator();

	const handleTabClick = (searchCode: string) =>
	{
		actions.closeCreator();
		actions.search(searchCode, '');
	};

	return (
		<div class="d-flex justify-content-center align-items-center gap-1 pt-1 container-fluid helium-card-tabs">
			<For each={nav.topLevelContexts}>
				{(ctx) => (
					<div
						class={clsx(
							'nav-item rounded-top border cursor-pointer overflow-hidden position-relative',
							(nav.currentSearchCode === ctx.searchCode && !nav.isCreatorOpen) && 'active'
						)}
						onClick={() => handleTabClick(ctx.searchCode)}
					>
						<div class="d-flex flex-shrink-1 justify-content-center align-items-center">
							{t('navigator.toplevelview.' + ctx.searchCode, ctx.searchCode)}
						</div>
					</div>
				)}
			</For>
		</div>
	);
}
