import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import clsx from 'clsx';

export interface IFurniDetailsProps
{
	name: string;
	description?: string;
	count: number;
	tradeable?: boolean;
	recyclable?: boolean;
	sellable?: boolean;
	isInRoom?: boolean;
	onPlace?: () => void;
	onTrade?: () => void;
	onSell?: () => void;
}

export function FurniDetails(props: IFurniDetailsProps): JSX.Element
{
	return (
		<div class="flex flex-col h-full bg-slate-800/30 border-t border-slate-700/50">
			{/* Item info */}
			<div class="flex-1 p-3 overflow-y-auto">
				<h3 class="text-sm font-semibold text-white mb-1">{props.name}</h3>
				<Show when={props.description}>
					<p class="text-xs text-slate-400 mb-2">{props.description}</p>
				</Show>
				<div class="flex items-center gap-2 text-xs text-slate-500">
					<span>Quantity: {props.count}</span>
					<Show when={props.tradeable}>
						<span class="text-green-400">Tradeable</span>
					</Show>
					<Show when={props.recyclable}>
						<span class="text-blue-400">Recyclable</span>
					</Show>
				</div>
			</div>

			{/* Action buttons */}
			<div class="flex items-center gap-2 p-3 border-t border-slate-700/50">
				<button
					type="button"
					class={clsx(
						'flex-1 py-2 px-3 rounded-lg text-sm font-medium',
						'bg-amber-500 hover:bg-amber-400 text-slate-900',
						'transition-colors'
					)}
					onClick={() => props.onPlace?.()}
				>
					Place in Room
				</button>
				<Show when={props.tradeable}>
					<button
						type="button"
						class={clsx(
							'py-2 px-3 rounded-lg text-sm font-medium',
							'bg-slate-700 hover:bg-slate-600 text-slate-300',
							'transition-colors'
						)}
						onClick={() => props.onTrade?.()}
					>
						Trade
					</button>
				</Show>
				<Show when={props.sellable}>
					<button
						type="button"
						class={clsx(
							'py-2 px-3 rounded-lg text-sm font-medium',
							'bg-slate-700 hover:bg-slate-600 text-slate-300',
							'transition-colors'
						)}
						onClick={() => props.onSell?.()}
					>
						Sell
					</button>
				</Show>
			</div>
		</div>
	);
}
