import type {JSX, ParentProps} from 'solid-js';
import {onCleanup, onMount} from 'solid-js';
import clsx from 'clsx';

export interface InfiniteScrollProps extends ParentProps
{
	onMore?: () => void;
	threshold?: number;
	class?: string;
}

export function InfiniteScroll(props: InfiniteScrollProps): JSX.Element
{
	let containerRef: HTMLDivElement | undefined;

	const handleScroll = () =>
	{
		if (!containerRef || !props.onMore) return;

		const {scrollTop, scrollHeight, clientHeight} = containerRef;
		const threshold = props.threshold ?? 100;

		if (scrollHeight - scrollTop - clientHeight < threshold)
		{
			props.onMore();
		}
	};

	onMount(() =>
	{
		containerRef?.addEventListener('scroll', handleScroll, {passive: true});
	});

	onCleanup(() =>
	{
		containerRef?.removeEventListener('scroll', handleScroll);
	});

	return (
		<div
			ref={containerRef}
			class={clsx('overflow-y-auto', props.class)}
		>
			{props.children}
		</div>
	);
}
