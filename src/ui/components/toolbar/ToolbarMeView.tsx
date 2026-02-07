import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';

/**
 * ToolbarMeView - "Me" dropdown menu from the toolbar.
 */
export function ToolbarMeView(): JSX.Element
{
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<Show when={isOpen()}>
			<div class="absolute bottom-[var(--spacing-toolbar)] right-4 w-[200px] bg-bg-secondary border border-border rounded-[var(--radius-lg)] shadow-lg p-2">
				<p class="text-text-muted text-center py-4 text-sm">Coming Soon</p>
			</div>
		</Show>
	);
}
