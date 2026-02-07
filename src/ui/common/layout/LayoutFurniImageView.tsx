import type {JSX} from 'solid-js';
import clsx from 'clsx';

export interface LayoutFurniImageViewProps
{
	type: number;
	id?: number;
	class?: string;
}

/**
 * LayoutFurniImageView - Displays a furniture item image.
 * Currently renders a placeholder; will integrate with furni asset loading.
 */
export function LayoutFurniImageView(props: LayoutFurniImageViewProps): JSX.Element
{
	return (
		<div
			class={clsx(
				'w-10 h-10 flex items-center justify-center',
				'bg-slate-700/50 rounded-md text-slate-400',
				props.class
			)}
			title={`Furni #${props.type}`}
		>
			<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
			</svg>
		</div>
	);
}
