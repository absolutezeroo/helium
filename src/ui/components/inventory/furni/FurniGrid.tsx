import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import {FurniItem} from './FurniItem';

export interface FurniGridItem
{
	id: number;
	type: number;
	name: string;
	count: number;
	isSelected?: boolean;
	isUnseen?: boolean;
	isLocked?: boolean;
}

export interface FurniGridProps
{
	items: FurniGridItem[];
	loading?: boolean;
	onItemSelect?: (id: number) => void;
	onItemPlace?: (id: number) => void;
}

export function FurniGrid(props: FurniGridProps): JSX.Element
{
	return (
		<div class="h-full overflow-y-auto p-2">
			<Show
				when={!props.loading}
				fallback={
					<div class="flex items-center justify-center h-32">
						<div class="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full"/>
					</div>
				}
			>
				<Show
					when={props.items.length > 0}
					fallback={
						<div class="flex flex-col items-center justify-center h-32 text-slate-500">
							<svg class="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
							</svg>
							<span class="text-sm">No furniture</span>
						</div>
					}
				>
					<div class="grid grid-cols-5 gap-2">
						<For each={props.items}>
							{(item) => (
								<FurniItem
									id={item.id}
									name={item.name}
									count={item.count}
									isSelected={item.isSelected}
									isUnseen={item.isUnseen}
									isLocked={item.isLocked}
									onClick={() => props.onItemSelect?.(item.id)}
									onDoubleClick={() => props.onItemPlace?.(item.id)}
								/>
							)}
						</For>
					</div>
				</Show>
			</Show>
		</div>
	);
}
