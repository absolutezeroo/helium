import type {JSX} from 'solid-js';
import clsx from 'clsx';

export interface InventoryHeaderProps
{
	title: string;
	onClose?: () => void;
	children?: JSX.Element;
}

export function InventoryHeader(props: InventoryHeaderProps): JSX.Element
{
	return (
		<div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-800/80 border-b border-slate-700/50">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
					<svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
					</svg>
				</div>
				<h2 class="text-sm font-semibold text-white">{props.title}</h2>
			</div>

			<div class="flex items-center gap-2">
				{props.children}
				<button
					type="button"
					class={clsx(
						'w-7 h-7 flex items-center justify-center rounded-lg',
						'text-slate-400 hover:text-white hover:bg-slate-700/50',
						'transition-colors'
					)}
					onClick={() => props.onClose?.()}
				>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
			</div>
		</div>
	);
}
