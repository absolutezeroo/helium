import type {JSX} from 'solid-js';
import clsx from 'clsx';

export interface LayoutAvatarImageViewProps
{
	figure?: string;
	direction?: number;
	class?: string;
}

/**
 * LayoutAvatarImageView - Displays an avatar by figure string.
 * Currently renders a placeholder; avatar rendering module not yet implemented.
 */
export function LayoutAvatarImageView(props: LayoutAvatarImageViewProps): JSX.Element
{
	return (
		<div
			class={clsx(
				'w-8 h-8 flex items-center justify-center',
				'bg-slate-700/50 rounded-md text-sm text-slate-400',
				props.class
			)}
			title={props.figure}
		>
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
			</svg>
		</div>
	);
}
