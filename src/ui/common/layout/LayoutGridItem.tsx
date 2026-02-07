import type {JSX, ParentProps} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';

export interface LayoutGridItemProps extends ParentProps
{
	isSelected?: boolean;
	isUnseen?: boolean;
	count?: number;
	disabled?: boolean;
	class?: string;
	onClick?: () => void;
	onDoubleClick?: () => void;
}

/**
 * LayoutGridItem - Grid cell for inventory/catalog items.
 */
export function LayoutGridItem(props: LayoutGridItemProps): JSX.Element
{
	return (
		<div
			class={clsx(
				'relative flex items-center justify-center',
				'w-full aspect-square rounded-lg border cursor-pointer',
				'transition-all duration-150',
				props.isSelected
					? 'bg-amber-500/20 border-amber-500/50 shadow-sm'
					: 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/50',
				props.disabled && 'opacity-50 cursor-not-allowed',
				props.class
			)}
			onClick={() => !props.disabled && props.onClick?.()}
			onDblClick={() => !props.disabled && props.onDoubleClick?.()}
		>
			{props.children}

			{/* Unseen dot */}
			<Show when={props.isUnseen}>
				<div class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/>
			</Show>

			{/* Count badge */}
			<Show when={props.count !== undefined && props.count! > 1}>
				<span class="absolute bottom-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold bg-slate-700 text-slate-300 rounded-full">
					{props.count! > 99 ? '99+' : props.count}
				</span>
			</Show>
		</div>
	);
}
