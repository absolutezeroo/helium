import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import {ModuleId, useModule} from '../../bridge';

/**
 * HotelView - The main hotel landing page shown when not in a room.
 * Evolution of LandingView with more features planned.
 */
export function HotelView(): JSX.Element
{
	const {state: session} = useModule(ModuleId.Session);

	return (
		<div class="absolute inset-0 bottom-[var(--spacing-toolbar)] flex justify-center px-6 pt-10 overflow-y-auto">
			<div class="max-w-[1200px] w-full">
				<Show when={session().userData}>
					{(user) => (
						<div class="text-center mb-10">
							<h2 class="text-[1.75rem] font-semibold mb-2">Welcome back, {user().name}!</h2>
							<p class="text-sm text-text-muted italic">{user().motto || 'No motto set'}</p>
						</div>
					)}
				</Show>

				<div class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
					<div class="glass glass-hover rounded-[var(--radius-lg)] p-10 text-center transition-all duration-200">
						<p>Hotel View</p>
						<p class="text-xs text-text-muted">Coming soon...</p>
					</div>
				</div>
			</div>
		</div>
	);
}
