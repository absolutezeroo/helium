import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import {NavigatorIcon} from '../common';

export interface PopularTag {
    tag: string;
    count: number;
}

export interface PopularTagsProps {
    tags: PopularTag[];
    loading?: boolean;
    maxTags?: number;
    onTagClick?: (tag: string) => void;
    class?: string;
}

/**
 * Popular tags display component
 */
export function PopularTags(props: PopularTagsProps): JSX.Element {
    const displayTags = () => {
        const max = props.maxTags ?? 10;
        return props.tags.slice(0, max);
    };

    return (
        <div class={`${props.class ?? ''}`}>
            <h3 class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <NavigatorIcon name="tag" size="sm" />
                Popular Tags
            </h3>

            <Show
                when={!props.loading}
                fallback={
                    <div class="flex items-center gap-2 text-slate-500 text-sm py-2">
                        <NavigatorIcon name="loading" size="sm" class="animate-spin" />
                        Loading tags...
                    </div>
                }
            >
                <Show
                    when={props.tags.length > 0}
                    fallback={
                        <p class="text-sm text-slate-500">No popular tags</p>
                    }
                >
                    <div class="flex flex-wrap gap-2">
                        <For each={displayTags()}>
                            {(item) => (
                                <button
                                    type="button"
                                    class={`
                                        inline-flex items-center gap-1
                                        px-2.5 py-1
                                        bg-slate-800 hover:bg-slate-700
                                        border border-slate-700 hover:border-slate-600
                                        rounded-full
                                        text-xs text-slate-300 hover:text-slate-100
                                        transition-colors
                                        ${props.onTagClick ? 'cursor-pointer' : 'cursor-default'}
                                    `}
                                    onClick={() => props.onTagClick?.(item.tag)}
                                    disabled={!props.onTagClick}
                                >
                                    <span>#{item.tag}</span>
                                    <span class="text-slate-500">({item.count})</span>
                                </button>
                            )}
                        </For>
                    </div>
                </Show>
            </Show>
        </div>
    );
}
