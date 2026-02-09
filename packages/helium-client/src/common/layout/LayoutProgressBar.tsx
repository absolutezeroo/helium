import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';

export interface LayoutProgressBarProps
{
	progress: number;
	text?: string;
	class?: string;
}

/**
 * LayoutProgressBar - Reusable progress bar with optional text.
 */
export function LayoutProgressBar(props: LayoutProgressBarProps): JSX.Element
{
	const clamped = () => Math.max(0, Math.min(100, props.progress));

	return (
		<div class={clsx('w-full', props.class)}>
			<div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
				<div
					class="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full transition-all duration-300"
					style={{width: `${clamped()}%`}}
				/>
			</div>
			<Show when={props.text}>
				<span class="text-xs text-text-muted mt-1">{props.text}</span>
			</Show>
		</div>
	);
}
