import {Component, Show} from 'solid-js';
import {ModuleId, useModule} from '../../bridge';

export const LandingView: Component = () =>
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
					<div
						class="glass glass-hover rounded-[var(--radius-lg)] p-10 text-center transition-all duration-200">
						<p>Landing View Widgets</p>
						<p class="text-xs text-text-muted">Coming soon...</p>
					</div>
				</div>
			</div>
		</div>
	);
};
