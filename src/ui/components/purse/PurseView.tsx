import type {JSX} from 'solid-js';
import {sessionStore} from '@ui/stores/sessionStore';

/**
 * PurseView - Currency display in the toolbar area.
 * Shows credits, diamonds, and duckets.
 */
export function PurseView(): JSX.Element
{
	const {state: session} = sessionStore;

	const credits = () => session.activityPoints[0] ?? 0;
	const diamonds = () => session.activityPoints[5] ?? 0;
	const duckets = () => session.activityPoints[105] ?? 0;

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
