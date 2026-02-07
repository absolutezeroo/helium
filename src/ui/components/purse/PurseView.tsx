import type {JSX} from 'solid-js';
import {ModuleId, useModule} from '../../bridge';

/**
 * PurseView - Currency display in the toolbar area.
 * Shows credits, diamonds, and duckets.
 */
export function PurseView(): JSX.Element
{
	const {state: session} = useModule(ModuleId.Session);

	const credits = () => session().activityPoints.get(0) ?? 0;
	const diamonds = () => session().activityPoints.get(5) ?? 0;
	const duckets = () => session().activityPoints.get(105) ?? 0;

	return (
		<div class="flex items-center gap-2">
			<span
				class="bg-credits/15 text-credits px-3 py-1 rounded-full text-xs font-medium border border-credits/25">
				{credits()} Credits
			</span>
			<span
				class="bg-diamonds/15 text-diamonds px-3 py-1 rounded-full text-xs font-medium border border-diamonds/25">
				{diamonds()} Diamonds
			</span>
			<span
				class="bg-duckets/15 text-duckets px-3 py-1 rounded-full text-xs font-medium border border-duckets/25">
				{duckets()} Duckets
			</span>
		</div>
	);
}
