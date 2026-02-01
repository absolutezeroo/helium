import type {JSX} from 'solid-js';
import {For, createSignal, onMount, Show} from 'solid-js';
import {NavigatorTab} from './NavigatorTab';
import {NavigatorIcon, type IconName} from '../common';

export interface TabDefinition
{
	id: string;
	label: string;
	icon?: IconName;
	badge?: number | string;
	disabled?: boolean;
}

export interface NavigatorTabsProps
{
	tabs: TabDefinition[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
	class?: string;
}

/**
 * Navigator tabs container - manages multiple tabs with horizontal scroll
 */
export function NavigatorTabs(props: NavigatorTabsProps): JSX.Element
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
		// Update on resize
		window.addEventListener('resize', updateScrollButtons);
	});

	const scroll = (direction: 'left' | 'right') =>
	{
		if (!scrollContainerRef) return;
		const scrollAmount = 150;
		scrollContainerRef.scrollBy({
			left: direction === 'left' ? -scrollAmount : scrollAmount,
			behavior: 'smooth',
		});
	};

	return (
		<div class={`relative flex items-center border-b border-slate-700 bg-slate-800/50 ${props.class ?? ''}`}>
			{/* Scroll left button */}
			<Show when={canScrollLeft()}>
				<button
					type="button"
					class="absolute left-0 z-10 h-full px-1.5 bg-gradient-to-r from-slate-800 via-slate-800/90 to-transparent hover:from-slate-700 transition-colors"
					onClick={() => scroll('left')}
				>
					<NavigatorIcon name="chevronLeft" size="sm" class="text-slate-300" />
				</button>
			</Show>

			{/* Tabs container */}
			<div
				ref={scrollContainerRef}
				class="flex items-center overflow-x-auto scrollbar-hide"
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

			{/* Scroll right button */}
			<Show when={canScrollRight()}>
				<button
					type="button"
					class="absolute right-0 z-10 h-full px-1.5 bg-gradient-to-l from-slate-800 via-slate-800/90 to-transparent hover:from-slate-700 transition-colors"
					onClick={() => scroll('right')}
				>
					<NavigatorIcon name="chevronRight" size="sm" class="text-slate-300" />
				</button>
			</Show>
		</div>
	);
}
