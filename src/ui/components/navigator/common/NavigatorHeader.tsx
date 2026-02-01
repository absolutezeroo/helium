import type {JSX, ParentProps} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';
import {IconButton} from './NavigatorButton';
import {type IconName, NavigatorIcon} from './NavigatorIcon';

export interface NavigatorHeaderProps extends ParentProps
{
	title: string;
	subtitle?: string;
	icon?: IconName;
	onClose?: () => void;
	onMinimize?: () => void;
	actions?: JSX.Element;
	class?: string;
}

/**
 * Navigator window header component
 */
export function NavigatorHeader(props: NavigatorHeaderProps): JSX.Element
{
	return (
		<div
			class={clsx(
				'flex items-center justify-between',
				'px-4 py-2.5',
				'bg-gradient-to-r from-slate-800 via-slate-800 to-slate-700',
				'border-b border-slate-600/50',
				'rounded-t-xl select-none',
				props.class
			)}
		>
			{/* Title section */}
			<div class="flex items-center gap-2.5 min-w-0">
				<Show when={props.icon}>
					<div class="p-1.5 rounded-lg bg-amber-500/10">
						<NavigatorIcon name={props.icon!} size="md" class="text-amber-400"/>
					</div>
				</Show>
				<div class="min-w-0">
					<h2 class="text-slate-100 font-semibold text-sm truncate">
						{props.title}
					</h2>
					{props.subtitle && (
						<p class="text-slate-400 text-xs truncate">
							{props.subtitle}
						</p>
					)}
				</div>
				{props.children}
			</div>

			{/* Actions section */}
			<div class="flex items-center gap-1 flex-shrink-0">
				{props.actions}
				{props.onMinimize && (
					<IconButton
						icon="minus"
						size="sm"
						variant="ghost"
						onClick={props.onMinimize}
						title="Minimize"
						class="text-white/80 hover:text-white hover:bg-white/10"
					/>
				)}
				{props.onClose && (
					<IconButton
						icon="close"
						size="sm"
						variant="ghost"
						onClick={props.onClose}
						title="Close"
						class="text-white/80 hover:text-white hover:bg-red-500/50"
					/>
				)}
			</div>
		</div>
	);
}
