import type {JSX, ParentProps} from 'solid-js';
import clsx from 'clsx';

export interface ButtonProps extends ParentProps
{
	variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
	size?: 'xs' | 'sm' | 'md';
	active?: boolean;
	disabled?: boolean;
	class?: string;
	title?: string;
	type?: 'button' | 'submit' | 'reset';
	onClick?: (e: MouseEvent) => void;
}

const VARIANT_CLASSES: Record<string, string> =
	{
		primary: 'bg-accent text-white hover:bg-accent-hover',
		secondary: 'bg-surface border border-border text-text-secondary hover:bg-surface-hover hover:border-border-hover hover:text-text-primary',
		ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
		danger: 'bg-error/15 text-error border border-error/25 hover:bg-error/25',
	};

const SIZE_CLASSES: Record<string, string> =
	{
		xs: 'px-2 py-1 text-xs',
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
	};

export function Button(props: ButtonProps): JSX.Element
{
	const variant = () => props.variant ?? 'secondary';
	const size = () => props.size ?? 'sm';

	return (
		<button
			type={props.type ?? 'button'}
			class={clsx(
				'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium',
				'transition-all duration-150 cursor-pointer',
				'disabled:opacity-50 disabled:cursor-not-allowed',
				VARIANT_CLASSES[variant()],
				SIZE_CLASSES[size()],
				props.active && 'ring-1 ring-accent',
				props.class
			)}
			disabled={props.disabled}
			title={props.title}
			onClick={props.onClick}
		>
			{props.children}
		</button>
	);
}
