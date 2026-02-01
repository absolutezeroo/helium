import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';

export interface FurniItemProps
{
	id: number;
	name: string;
	count: number;
	isSelected?: boolean;
	isUnseen?: boolean;
	isLocked?: boolean;
	onClick?: () => void;
	onDoubleClick?: () => void;
}

export function FurniItem(props: FurniItemProps): JSX.Element
{
	return (
		<div
			class={clsx(
				'relative flex flex-col items-center justify-center',
				'w-16 h-16 rounded-lg cursor-pointer',
				'transition-all duration-150',
				props.isSelected
					? 'bg-amber-500/30 ring-2 ring-amber-400/50'
					: 'bg-slate-700/50 hover:bg-slate-600/50',
				props.isLocked && 'opacity-50 cursor-not-allowed'
			)}
			onClick={() => !props.isLocked && props.onClick?.()}
			onDblClick={() => !props.isLocked && props.onDoubleClick?.()}
			title={props.name}
		>
			{/* Placeholder for furni image */}
			<div class="w-10 h-10 bg-slate-600/50 rounded flex items-center justify-center">
				<svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
				</svg>
			</div>

			{/* Count badge */}
			<Show when={props.count > 1}>
				<span class="absolute bottom-1 right-1 min-w-[16px] h-[16px] flex items-center justify-center px-1 text-[10px] font-bold bg-slate-800 text-slate-300 rounded">
					{props.count > 99 ? '99+' : props.count}
				</span>
			</Show>

			{/* Unseen indicator */}
			<Show when={props.isUnseen}>
				<span class="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"/>
			</Show>

			{/* Locked indicator */}
			<Show when={props.isLocked}>
				<div class="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-lg">
					<svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
					</svg>
				</div>
			</Show>
		</div>
	);
}
