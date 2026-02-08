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
		<div class="d-flex align-items-center gap-2">
			<span class="badge bg-warning text-dark">
				{credits()} Credits
			</span>
			<span class="badge bg-info text-white">
				{diamonds()} Diamonds
			</span>
			<span class="badge bg-success text-white">
				{duckets()} Duckets
			</span>
		</div>
	);
}
