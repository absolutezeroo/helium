import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import clsx from 'clsx';
import {NavigatorIcon} from '../common';
import {useNavigatorLocalization} from '../hooks';

export interface IPopularTag
{
	tag: string;
	count: number;
}

export interface IPopularTagsProps
{
	tags: IPopularTag[];
	loading?: boolean;
	maxTags?: number;
	onTagClick?: (tag: string) => void;
	class?: string;
}

/**
 * Popular tags display component
 */
export function PopularTags(props: IPopularTagsProps): JSX.Element
{
	const {t, keys} = useNavigatorLocalization();

	const displayTags = () =>
	{
		const max = props.maxTags ?? 10;
		return props.tags.slice(0, max);
	};

	return (
		<div class={clsx(props.class)}>
			<h3 class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
				<NavigatorIcon name="tag" size="xs" class="text-amber-500/70"/>
				{t(keys.POPULAR_TAGS_TITLE)}
			</h3>

			<Show
				when={!props.loading}
				fallback={
					<div class="flex items-center gap-2 text-slate-500 text-sm py-2">
						<NavigatorIcon name="loading" size="sm" class="animate-spin"/>
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
					<div class="flex flex-wrap gap-1.5">
						<For each={displayTags()}>
							{(item) => (
								<button
									type="button"
									class={clsx(
										'inline-flex items-center gap-1',
										'px-2.5 py-1',
										'bg-slate-800/60 hover:bg-amber-500/10',
										'border border-slate-700/50 hover:border-amber-500/30',
										'rounded-full',
										'text-xs text-slate-300 hover:text-amber-300',
										'transition-all duration-150',
										props.onTagClick ? 'cursor-pointer' : 'cursor-default'
									)}
									onClick={() => props.onTagClick?.(item.tag)}
									disabled={!props.onTagClick}
								>
									<span class="text-amber-500/70">#</span>
									<span>{item.tag}</span>
									<span class="text-slate-500 text-[10px]">{item.count}</span>
								</button>
							)}
						</For>
					</div>
				</Show>
			</Show>
		</div>
	);
}
