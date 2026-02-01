import type {JSX} from 'solid-js';
import {Show, createSignal} from 'solid-js';
import {NavigatorIcon} from '../common';
import type {IconName} from '../common';

export interface CategoryItemProps {
    id: number;
    name: string;
    icon?: IconName;
    roomCount?: number;
    userCount?: number;
    isExpanded?: boolean;
    isSelected?: boolean;
    hasSubcategories?: boolean;
    depth?: number;
    onClick?: (id: number) => void;
    onToggle?: (id: number) => void;
    class?: string;
    children?: JSX.Element;
}

/**
 * Category item component - individual category in a list
 */
export function CategoryItem(props: CategoryItemProps): JSX.Element {
    const depth = () => props.depth ?? 0;
    const paddingLeft = () => `${depth() * 16 + 12}px`;

    const handleClick = () => {
        props.onClick?.(props.id);
    };

    const handleToggle = (e: MouseEvent) => {
        e.stopPropagation();
        props.onToggle?.(props.id);
    };

    return (
        <div class={props.class ?? ''}>
            <div
                class={`
                    flex items-center gap-2 py-2 pr-3
                    cursor-pointer
                    transition-colors duration-100
                    ${props.isSelected
                        ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-500'
                        : 'hover:bg-slate-700/50 text-slate-300 hover:text-slate-100 border-l-2 border-transparent'
                    }
                `}
                style={{'padding-left': paddingLeft()}}
                onClick={handleClick}
            >
                {/* Expand/collapse toggle */}
                <Show when={props.hasSubcategories}>
                    <button
                        type="button"
                        class="p-0.5 rounded hover:bg-slate-600/50 transition-colors"
                        onClick={handleToggle}
                    >
                        <NavigatorIcon
                            name={props.isExpanded ? 'chevronDown' : 'chevronRight'}
                            size="sm"
                            class="text-slate-400"
                        />
                    </button>
                </Show>
                <Show when={!props.hasSubcategories}>
                    <div class="w-5" /> {/* Spacer */}
                </Show>

                {/* Icon */}
                <Show when={props.icon}>
                    <NavigatorIcon
                        name={props.icon!}
                        size="sm"
                        class={props.isSelected ? 'text-blue-400' : 'text-slate-400'}
                    />
                </Show>

                {/* Name */}
                <span class="flex-1 truncate text-sm">
                    {props.name}
                </span>

                {/* Room count */}
                <Show when={props.roomCount !== undefined}>
                    <span class="text-xs text-slate-500">
                        {props.roomCount} rooms
                    </span>
                </Show>

                {/* User count */}
                <Show when={props.userCount !== undefined}>
                    <span class="flex items-center gap-1 text-xs text-green-400">
                        <NavigatorIcon name="users" size="xs" />
                        {props.userCount}
                    </span>
                </Show>
            </div>

            {/* Children (subcategories) */}
            <Show when={props.isExpanded && props.children}>
                <div class="border-l border-slate-700/50 ml-6">
                    {props.children}
                </div>
            </Show>
        </div>
    );
}
