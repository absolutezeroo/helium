import type {JSX} from 'solid-js';
import clsx from 'clsx';

export interface LayoutBadgeImageViewProps
{
	badgeCode: string;
	class?: string;
}

/**
 * LayoutBadgeImageView - Displays a badge image by code.
 * Currently renders a placeholder; will integrate with badge asset loading.
 */
export function LayoutBadgeImageView(props: LayoutBadgeImageViewProps): JSX.Element
{
	return (
		<div
			class={clsx(
				'w-10 h-10 flex items-center justify-center',
				'bg-slate-700/50 rounded-md text-xs text-slate-400',
				props.class
			)}
			title={props.badgeCode}
		>
			{props.badgeCode.slice(0, 3).toUpperCase()}
		</div>
	);
}
