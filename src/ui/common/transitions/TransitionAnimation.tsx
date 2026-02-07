import type {JSX, ParentProps} from 'solid-js';
import {Show, createSignal, onMount} from 'solid-js';
import clsx from 'clsx';

export type AnimationType = 'fade-in' | 'slide-up' | 'slide-down' | 'collapse';

export interface TransitionAnimationProps extends ParentProps
{
	type?: AnimationType;
	show?: boolean;
	class?: string;
}

const ANIMATION_CLASSES: Record<AnimationType, { from: string; to: string }> =
{
	'fade-in': {
		from: 'opacity-0',
		to: 'opacity-100',
	},
	'slide-up': {
		from: 'opacity-0 translate-y-2',
		to: 'opacity-100 translate-y-0',
	},
	'slide-down': {
		from: 'opacity-0 -translate-y-2',
		to: 'opacity-100 translate-y-0',
	},
	'collapse': {
		from: 'opacity-0 scale-y-0',
		to: 'opacity-100 scale-y-100',
	},
};

/**
 * TransitionAnimation - Wrapper for CSS transitions.
 */
export function TransitionAnimation(props: TransitionAnimationProps): JSX.Element
{
	const type = () => props.type ?? 'fade-in';
	const [entered, setEntered] = createSignal(false);

	onMount(() =>
	{
		requestAnimationFrame(() => setEntered(true));
	});

	return (
		<Show when={props.show !== false}>
			<div
				class={clsx(
					'transition-all duration-200 ease-out',
					entered()
						? ANIMATION_CLASSES[type()].to
						: ANIMATION_CLASSES[type()].from,
					props.class
				)}
			>
				{props.children}
			</div>
		</Show>
	);
}
