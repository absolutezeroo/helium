import type {JSX, ParentProps} from 'solid-js';
import clsx from 'clsx';

export interface BadgeProps extends ParentProps
{
	variant?: 'default' | 'success' | 'warning' | 'error' | 'accent';
	class?: string;
}

const VARIANT_CLASSES: Record<string, string> =
{
	default: 'bg-surface-active text-text-secondary',
	success: 'bg-success/15 text-success border border-success/25',
	warning: 'bg-warning/15 text-warning border border-warning/25',
	error: 'bg-error/15 text-error border border-error/25',
	accent: 'bg-accent-muted text-accent',
};

export function Badge(props: BadgeProps): JSX.Element
{
	const variant = () => props.variant ?? 'default';

	return (
		<span
			class={clsx(
				'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
				VARIANT_CLASSES[variant()],
				props.class
			)}
		>
			{props.children}
		</span>
	);
}
