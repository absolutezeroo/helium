import type {JSX} from 'solid-js';
import clsx from 'clsx';

export interface SkeletonProps
{
	class?: string;
	width?: string | number;
	height?: string | number;
	rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
	animate?: boolean;
}

/**
 * Skeleton loading placeholder
 */
export function Skeleton(props: SkeletonProps): JSX.Element
{
	const roundedClass = () =>
	{
		switch (props.rounded)
		{
			case 'none':
				return 'rounded-none';
			case 'sm':
				return 'rounded-sm';
			case 'lg':
				return 'rounded-lg';
			case 'full':
				return 'rounded-full';
			default:
				return 'rounded-md';
		}
	};

	return (
		<div
			class={clsx(
				'bg-slate-700/50',
				roundedClass(),
				(props.animate !== false) && 'animate-pulse',
				props.class
			)}
			style={{
				width: typeof props.width === 'number' ? `${props.width}px` : props.width,
				height: typeof props.height === 'number' ? `${props.height}px` : props.height,
			}}
		/>
	);
}

/**
 * Room card skeleton for loading state
 */
export function RoomCardSkeleton(): JSX.Element
{
	return (
		<div class="flex gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
			{/* Thumbnail skeleton */}
			<Skeleton width={64} height={64} rounded="md"/>

			{/* Content skeleton */}
			<div class="flex-1 space-y-2">
				{/* Title */}
				<Skeleton height={16} width="70%" rounded="sm"/>
				{/* Owner */}
				<Skeleton height={12} width="40%" rounded="sm"/>
				{/* Description */}
				<Skeleton height={12} width="90%" rounded="sm"/>
				{/* Footer */}
				<div class="flex items-center gap-2 pt-1">
					<Skeleton height={14} width={60} rounded="sm"/>
					<Skeleton height={14} width={40} rounded="sm"/>
				</div>
			</div>
		</div>
	);
}

/**
 * Compact room card skeleton
 */
export function RoomCardCompactSkeleton(): JSX.Element
{
	return (
		<div class="flex items-center gap-3 px-3 py-2.5 bg-slate-800/30 border border-slate-700/50 rounded-lg">
			{/* Icon skeleton */}
			<Skeleton width={32} height={32} rounded="md"/>

			{/* Content skeleton */}
			<div class="flex-1 space-y-1.5">
				<Skeleton height={14} width="60%" rounded="sm"/>
				<Skeleton height={10} width="30%" rounded="sm"/>
			</div>

			{/* User count skeleton */}
			<Skeleton height={20} width={50} rounded="full"/>
		</div>
	);
}

/**
 * Category item skeleton
 */
export function CategoryItemSkeleton(): JSX.Element
{
	return (
		<div class="flex items-center gap-2 px-3 py-2">
			<Skeleton width={16} height={16} rounded="sm"/>
			<Skeleton height={14} width="70%" rounded="sm"/>
		</div>
	);
}

/**
 * Tab skeleton
 */
export function TabSkeleton(): JSX.Element
{
	return (
		<div class="px-4 py-2.5">
			<Skeleton height={16} width={80} rounded="sm"/>
		</div>
	);
}
