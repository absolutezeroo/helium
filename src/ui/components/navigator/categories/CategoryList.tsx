import type {JSX} from 'solid-js';
import {createSignal, For, Show} from 'solid-js';
import clsx from 'clsx';
import {CategoryItem} from './CategoryItem';
import type {IconName} from '../common';
import {NavigatorIcon, CategoryItemSkeleton} from '../common';

export interface Category
{
	id: number;
	name: string;
	icon?: IconName;
	roomCount?: number;
	userCount?: number;
	subcategories?: Category[];
}

export interface CategoryListProps
{
	categories: Category[];
	selectedId?: number;
	loading?: boolean;
	title?: string;
	onCategoryClick?: (id: number) => void;
	class?: string;
}

/**
 * Category list component - displays hierarchical categories
 */
export function CategoryList(props: CategoryListProps): JSX.Element
{
	const [expandedIds, setExpandedIds] = createSignal<Set<number>>(new Set());

	const toggleExpanded = (id: number) =>
	{
		setExpandedIds((prev) =>
		{
			const next = new Set(prev);
			if (next.has(id))
			{
				next.delete(id);
			} else
			{
				next.add(id);
			}
			return next;
		});
	};

	const renderCategory = (category: Category, depth: number = 0): JSX.Element =>
	{
		const hasSubcategories = category.subcategories && category.subcategories.length > 0;
		const isExpanded = expandedIds().has(category.id);

		return (
			<CategoryItem
				id={category.id}
				name={category.name}
				icon={category.icon}
				roomCount={category.roomCount}
				userCount={category.userCount}
				isExpanded={isExpanded}
				isSelected={props.selectedId === category.id}
				hasSubcategories={hasSubcategories}
				depth={depth}
				onClick={props.onCategoryClick}
				onToggle={toggleExpanded}
			>
				<Show when={hasSubcategories && isExpanded}>
					<For each={category.subcategories}>
						{(sub) => renderCategory(sub, depth + 1)}
					</For>
				</Show>
			</CategoryItem>
		);
	};

	return (
		<div class={clsx(props.class)}>
			{/* Title */}
			<Show when={props.title}>
				<h3 class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 px-3">
					{props.title}
				</h3>
			</Show>

			{/* Loading state with skeletons */}
			<Show when={props.loading}>
				<div class="space-y-1">
					<CategoryItemSkeleton/>
					<CategoryItemSkeleton/>
					<CategoryItemSkeleton/>
					<CategoryItemSkeleton/>
					<CategoryItemSkeleton/>
					<CategoryItemSkeleton/>
				</div>
			</Show>

			{/* Empty state */}
			<Show when={!props.loading && props.categories.length === 0}>
				<div class="flex flex-col items-center justify-center py-8 px-4 text-center">
					<div class="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
						<NavigatorIcon name="search" size="md" class="text-slate-500"/>
					</div>
					<p class="text-sm text-slate-400 font-medium">No categories available</p>
					<p class="text-xs text-slate-500 mt-1">Try refreshing or check back later</p>
				</div>
			</Show>

			{/* Category list */}
			<Show when={!props.loading && props.categories.length > 0}>
				<div class="divide-y divide-slate-700/30">
					<For each={props.categories}>
						{(category) => renderCategory(category)}
					</For>
				</div>
			</Show>
		</div>
	);
}
