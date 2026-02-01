import type {JSX} from 'solid-js';
import clsx from 'clsx';

export interface ProgressBarProps
{
	value: number;
	max: number;
	size?: 'xs' | 'sm' | 'md';
	showLabel?: boolean;
	colorMode?: 'auto' | 'default' | 'success' | 'warning' | 'danger';
	class?: string;
}

/**
 * Progress bar component with automatic color based on fill percentage
 */
export function ProgressBar(props: ProgressBarProps): JSX.Element
{
	const percentage = () => Math.min(100, Math.max(0, (props.value / props.max) * 100));

	const getColor = () =>
	{
		if (props.colorMode && props.colorMode !== 'auto')
		{
			switch (props.colorMode)
			{
				case 'success':
					return 'bg-green-500';
				case 'warning':
					return 'bg-yellow-500';
				case 'danger':
					return 'bg-red-500';
				default:
					return 'bg-amber-500';
			}
		}

		// Auto color based on percentage
		const pct = percentage();
		if (pct >= 100) return 'bg-red-500';
		if (pct >= 75) return 'bg-orange-500';
		if (pct >= 50) return 'bg-yellow-500';
		return 'bg-green-500';
	};

	const getTextColor = () =>
	{
		if (props.colorMode && props.colorMode !== 'auto')
		{
			switch (props.colorMode)
			{
				case 'success':
					return 'text-green-400';
				case 'warning':
					return 'text-yellow-400';
				case 'danger':
					return 'text-red-400';
				default:
					return 'text-amber-400';
			}
		}

		const pct = percentage();
		if (pct >= 100) return 'text-red-400';
		if (pct >= 75) return 'text-orange-400';
		if (pct >= 50) return 'text-yellow-400';
		return 'text-green-400';
	};

	const sizeClass = () =>
	{
		switch (props.size)
		{
			case 'xs':
				return 'h-1';
			case 'md':
				return 'h-2.5';
			default:
				return 'h-1.5';
		}
	};

	return (
		<div class={clsx('flex items-center gap-2', props.class)}>
			{/* Progress bar track */}
			<div class={clsx(
				'flex-1 rounded-full bg-slate-700/50 overflow-hidden',
				sizeClass()
			)}>
				{/* Progress bar fill */}
				<div
					class={clsx(
						'h-full rounded-full transition-all duration-300',
						getColor()
					)}
					style={{width: `${percentage()}%`}}
				/>
			</div>

			{/* Label */}
			{props.showLabel && (
				<span class={clsx('text-xs font-medium tabular-nums', getTextColor())}>
					{props.value}/{props.max}
				</span>
			)}
		</div>
	);
}

/**
 * User count progress bar with icon
 */
export function UserCountBar(props: {
	userCount: number;
	maxUserCount: number;
	showLabel?: boolean;
	size?: 'xs' | 'sm' | 'md';
	class?: string;
}): JSX.Element
{
	return (
		<div class={clsx('flex items-center gap-1.5', props.class)}>
			<svg
				class="w-3 h-3 text-slate-400 flex-shrink-0"
				fill="currentColor"
				viewBox="0 0 20 20"
			>
				<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
			</svg>
			<ProgressBar
				value={props.userCount}
				max={props.maxUserCount}
				size={props.size ?? 'sm'}
				showLabel={props.showLabel ?? true}
				colorMode="auto"
				class="flex-1"
			/>
		</div>
	);
}
