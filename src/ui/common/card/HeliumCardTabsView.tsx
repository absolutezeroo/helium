import type {JSX} from 'solid-js';
import {For} from 'solid-js';
import clsx from 'clsx';

export interface TabItem
{
	id: string;
	label: string;
	count?: number;
	icon?: JSX.Element;
}

export interface HeliumCardTabsViewProps
{
	tabs: TabItem[];
	activeTab: string;
	onTabChange?: (id: string) => void;
	class?: string;
}

/**
 * HeliumCardTabsView - Reusable tabs for card windows.
 */
export function HeliumCardTabsView(props: HeliumCardTabsViewProps): JSX.Element
{
	return (
		<div
			class={clsx(
				'flex items-center gap-1 px-2 py-2',
				'bg-slate-800/50 border-b border-slate-700/50',
				'overflow-x-auto',
				props.class
			)}
		>
			<For each={props.tabs}>
				{(tab) => (
					<button
						type="button"
						class={clsx(
							'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
							'transition-all duration-200 whitespace-nowrap',
							props.activeTab === tab.id
								? 'bg-amber-500/20 text-amber-400 shadow-sm'
								: 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
						)}
						onClick={() => props.onTabChange?.(tab.id)}
					>
						{tab.icon}
						<span>{tab.label}</span>
						{tab.count !== undefined && tab.count > 0 && (
							<span
								class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-xs font-bold bg-red-500 text-white rounded-full"
							>
								{tab.count > 99 ? '99+' : tab.count}
							</span>
						)}
					</button>
				)}
			</For>
		</div>
	);
}
