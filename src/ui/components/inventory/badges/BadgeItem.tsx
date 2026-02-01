import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';

export interface BadgeItemProps
{
	badgeId: string;
	name?: string;
	isSelected?: boolean;
	isActive?: boolean;
	isUnseen?: boolean;
	onClick?: () => void;
	onDoubleClick?: () => void;
}

export function BadgeItem(props: BadgeItemProps): JSX.Element
{
	return (
		<div
			class={clsx(
				'relative flex flex-col items-center justify-center',
				'w-14 h-14 rounded-lg cursor-pointer',
				'transition-all duration-150',
				props.isSelected
					? 'bg-amber-500/30 ring-2 ring-amber-400/50'
					: props.isActive
						? 'bg-green-500/20 ring-1 ring-green-400/50'
						: 'bg-slate-700/50 hover:bg-slate-600/50'
			)}
			onClick={() => props.onClick?.()}
			onDblClick={() => props.onDoubleClick?.()}
			title={props.name ?? props.badgeId}
		>
			{/* Badge image placeholder */}
			<div class="w-10 h-10 flex items-center justify-center text-[10px] text-slate-400 font-mono">
				{props.badgeId.substring(0, 6)}
			</div>

			{/* Active indicator */}
			<Show when={props.isActive}>
				<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-400 rounded-full"/>
			</Show>

			{/* Unseen indicator */}
			<Show when={props.isUnseen}>
				<span class="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"/>
			</Show>
		</div>
	);
}
