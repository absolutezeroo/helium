import type {JSX} from 'solid-js';
import {For} from 'solid-js';
import clsx from 'clsx';
import {InventoryIcon} from '../common';
import type {InventoryIconName} from '../common';

export interface InventoryTab
{
	id: string;
	label: string;
	icon: InventoryIconName;
	unseenCount?: number;
}

export interface InventoryTabsProps
{
	tabs: InventoryTab[];
	activeTab: string;
	onTabChange?: (id: string) => void;
}

export function InventoryTabs(props: InventoryTabsProps): JSX.Element
{
	return (
		<div class="flex items-center gap-1 px-2 py-2 bg-slate-800/50 border-b border-slate-700/50 overflow-x-auto">
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
						<InventoryIcon name={tab.icon} size="sm"/>
						<span>{tab.label}</span>
						{tab.unseenCount && tab.unseenCount > 0 && (
							<span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-xs font-bold bg-red-500 text-white rounded-full">
								{tab.unseenCount > 99 ? '99+' : tab.unseenCount}
							</span>
						)}
					</button>
				)}
			</For>
		</div>
	);
}
