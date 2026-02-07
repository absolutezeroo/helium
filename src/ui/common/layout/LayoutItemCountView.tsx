import type {JSX} from 'solid-js';
import clsx from 'clsx';

export interface LayoutItemCountViewProps
{
	count: number;
	class?: string;
}

/**
 * LayoutItemCountView - Small badge counter for unseen items.
 */
export function LayoutItemCountView(props: LayoutItemCountViewProps): JSX.Element
{
	return (
		<span
			class={clsx(
				'inline-flex items-center justify-center',
				'min-w-[20px] h-5 px-1.5',
				'text-xs font-bold bg-red-500 text-white rounded-full',
				props.class
			)}
		>
			{props.count > 99 ? '99+' : props.count}
		</span>
	);
}
