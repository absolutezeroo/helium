import type {JSX, ParentProps} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';

export interface HeliumCardHeaderViewProps extends ParentProps
{
	title: string;
	icon?: JSX.Element;
	onClose?: () => void;
	onMinimize?: () => void;
	class?: string;
}

/**
 * HeliumCardHeaderView - Standard window header.
 *
 * Replaces NavigatorHeader and InventoryHeader.
 * Automatically has the `drag-handle` class for HeliumCardView to detect.
 */
export function HeliumCardHeaderView(props: HeliumCardHeaderViewProps): JSX.Element
{
	return (
		<div
			class={clsx(
				'drag-handle flex items-center justify-between',
				'px-4 py-2.5',
				'bg-gradient-to-r from-slate-800 via-slate-800 to-slate-700',
				'border-b border-slate-600/50',
				'rounded-t-xl select-none cursor-move',
				props.class
			)}
		>
			{/* Title section */}
			<div class="flex items-center gap-2.5 min-w-0">
				<Show when={props.icon}>
					<div class="p-1.5 rounded-lg bg-amber-500/10 flex-shrink-0">
						{props.icon}
					</div>
				</Show>
				<h2 class="text-slate-100 font-semibold text-sm truncate">
					{props.title}
				</h2>
				{props.children}
			</div>

			{/* Window controls */}
			<div class="flex items-center gap-1 flex-shrink-0">
				<Show when={props.onMinimize}>
					<button
						type="button"
						class="w-7 h-7 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
						onClick={props.onMinimize}
						title="Minimize"
					>
						<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
						</svg>
					</button>
				</Show>
				<Show when={props.onClose}>
					<button
						type="button"
						class="w-7 h-7 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-red-500/50 transition-colors"
						onClick={props.onClose}
						title="Close"
					>
						<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</button>
				</Show>
			</div>
		</div>
	);
}
