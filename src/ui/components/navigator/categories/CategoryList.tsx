import type {JSX} from 'solid-js';
import {For, Show, createSignal} from 'solid-js';
import {CategoryItem} from './CategoryItem';
import {NavigatorIcon} from '../common';
import type {IconName} from '../common';

export interface Category {
    id: number;
    name: string;
    icon?: IconName;
    roomCount?: number;
    userCount?: number;
    subcategories?: Category[];
}

export interface CategoryListProps {
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
export function CategoryList(props: CategoryListProps): JSX.Element {
    const [expandedIds, setExpandedIds] = createSignal<Set<number>>(new Set());

    const toggleExpanded = (id: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const renderCategory = (category: Category, depth: number = 0): JSX.Element => {
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
        <div class={`${props.class ?? ''}`}>
            {/* Title */}
            <Show when={props.title}>
                <h3 class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 px-3">
                    {props.title}
                </h3>
            </Show>

            {/* Loading state */}
            <Show when={props.loading}>
                <div class="flex items-center gap-2 text-slate-500 text-sm py-4 px-3">
                    <NavigatorIcon name="loading" size="sm" class="animate-spin" />
                    Loading categories...
                </div>
            </Show>

            {/* Empty state */}
            <Show when={!props.loading && props.categories.length === 0}>
                <div class="text-sm text-slate-500 py-4 px-3">
                    No categories available
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
