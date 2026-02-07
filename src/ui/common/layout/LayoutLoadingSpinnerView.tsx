import type {JSX} from 'solid-js';
import clsx from 'clsx';

export interface LayoutLoadingSpinnerViewProps
{
	size?: 'sm' | 'md' | 'lg';
	class?: string;
}

const SIZE_CLASSES: Record<string, string> =
	{
		sm: 'w-5 h-5 border-2',
		md: 'w-8 h-8 border-2',
		lg: 'w-12 h-12 border-3',
	};

/**
 * LayoutLoadingSpinnerView - Reusable loading spinner.
 */
export function LayoutLoadingSpinnerView(props: LayoutLoadingSpinnerViewProps): JSX.Element
{
	const size = () => props.size ?? 'md';

	return (
		<div
			class={clsx(
				'rounded-full border-border border-t-accent animate-spin',
				SIZE_CLASSES[size()],
				props.class
			)}
		/>
	);
}
