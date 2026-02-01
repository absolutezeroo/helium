import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';
import {type IconName, NavigatorIcon} from '../common';

export interface NavigatorTabProps
{
	id: string;
	label: string;
	icon?: IconName;
	badge?: number | string;
	disabled?: boolean;
	isActive: boolean;
	onClick: (tabId: string) => void;
}

/**
 * Individual navigator tab button
 */
export function NavigatorTab(props: NavigatorTabProps): JSX.Element
{
	const handleClick = () =>
	{
		if (!props.disabled)
		{
			props.onClick(props.id);
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
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
