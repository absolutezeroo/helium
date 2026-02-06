import type {JSX} from 'solid-js';
import {createSignal, For, onMount, Show} from 'solid-js';
import clsx from 'clsx';
import type {IconName} from '../common';
import {NavigatorIcon} from '../common';

export interface TabDefinition
{
	id: string;
	label: string;
	icon?: IconName;
	badge?: number | string;
	disabled?: boolean;
}

export interface NavigatorTabsViewProps
{
	tabs: TabDefinition[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
	class?: string;
}

function NavigatorTab(props: {
	id: string;
	label: string;
	icon?: IconName;
	badge?: number | string;
	disabled?: boolean;
	isActive: boolean;
	onClick: (tabId: string) => void;
}): JSX.Element
{
	return (
		<button
			type="button"
			onClick={() => !props.disabled && props.onClick(props.id)}
			disabled={props.disabled}
			class={clsx(
				'relative flex items-center gap-1.5 px-3 py-1.5',
				'text-xs font-medium whitespace-nowrap',
				'rounded-md transition-all duration-150 flex-shrink-0',
				props.isActive
					? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
					: 'text-slate-400 bg-slate-700/30 border border-transparent hover:text-slate-200 hover:bg-slate-700/50 hover:border-slate-600/50',
				props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
			)}
		>
			<Show when={props.icon}>
				<NavigatorIcon
					name={props.icon!}
					size="sm"
					class={props.isActive ? 'text-amber-400' : 'text-slate-400'}
				/>
			</Show>
			<span class="capitalize">{props.label}</span>
			<Show when={props.badge !== undefined}>
				<span
					class={clsx(
						'ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full',
						props.isActive
							? 'bg-amber-400/20 text-amber-300'
							: 'bg-slate-600 text-slate-300'
					)}
				>
					{props.badge}
				</span>
			</Show>
		</button>
	);
}

export function NavigatorTabsView(props: NavigatorTabsViewProps): JSX.Element
{
	let scrollContainerRef: HTMLDivElement | undefined;
	const [canScrollLeft, setCanScrollLeft] = createSignal(false);
	const [canScrollRight, setCanScrollRight] = createSignal(false);

	const updateScrollButtons = () =>
	{
		if (!scrollContainerRef) return;
		const {scrollLeft, scrollWidth, clientWidth} = scrollContainerRef;
		setCanScrollLeft(scrollLeft > 0);
		setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
	};

	onMount(() =>
	{
		updateScrollButtons();
		scrollContainerRef?.addEventListener('scroll', updateScrollButtons);
		window.addEventListener('resize', updateScrollButtons);
	});

	const scroll = (direction: 'left' | 'right') =>
	{
		if (!scrollContainerRef) return;
		scrollContainerRef.scrollBy({
			left: direction === 'left' ? -150 : 150,
			behavior: 'smooth',
		});
	};

	return (
		<div class={clsx('relative flex items-center border-b border-slate-700/50 bg-slate-800/30', props.class)}>
			<Show when={canScrollLeft()}>
				<button
					type="button"
					class="absolute left-0 z-10 h-full px-2 bg-gradient-to-r from-slate-800 via-slate-800/95 to-transparent hover:from-slate-700 transition-colors"
					onClick={() => scroll('left')}
				>
					<NavigatorIcon name="chevronLeft" size="sm" class="text-slate-300"/>
				</button>
			</Show>

			<div
				ref={scrollContainerRef}
				class="flex items-center gap-2 px-3 py-2 overflow-x-auto"
				style={{"scroll-behavior": "smooth", "-ms-overflow-style": "none", "scrollbar-width": "none"}}
			>
				<For each={props.tabs}>
					{(tab) => (
						<NavigatorTab
							id={tab.id}
							label={tab.label}
							icon={tab.icon}
							badge={tab.badge}
							disabled={tab.disabled}
							isActive={props.activeTab === tab.id}
							onClick={props.onTabChange}
						/>
					)}
				</For>
			</div>

			<Show when={canScrollRight()}>
				<button
					type="button"
					class="absolute right-0 z-10 h-full px-1.5 bg-gradient-to-l from-slate-800 via-slate-800/90 to-transparent hover:from-slate-700 transition-colors"
					onClick={() => scroll('right')}
				>
					<NavigatorIcon name="chevronRight" size="sm" class="text-slate-300"/>
				</button>
			</Show>
		</div>
	);
}
