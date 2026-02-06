import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import {NavigatorButton, NavigatorIcon} from '../common';

export interface IRoomInfoActionsProps
{
	roomId: number;
	isFavourite?: boolean;
	isHome?: boolean;
	canRate?: boolean;
	canEdit?: boolean;
	canDelete?: boolean;
	onEnterRoom?: (roomId: number) => void;
	onToggleFavourite?: (roomId: number) => void;
	onSetHome?: (roomId: number) => void;
	onRate?: (roomId: number, rating: number) => void;
	onEdit?: (roomId: number) => void;
	onDelete?: (roomId: number) => void;
	onReport?: (roomId: number) => void;
	class?: string;
}

/**
 * Room info actions - action buttons for room interaction
 */
export function RoomInfoActions(props: IRoomInfoActionsProps): JSX.Element
{
	return (
		<div class={`space-y-3 ${props.class ?? ''}`}>
			{/* Primary actions */}
			<div class="flex gap-2">
				<NavigatorButton
					variant="primary"
					class="flex-1"
					onClick={() => props.onEnterRoom?.(props.roomId)}
				>
					<NavigatorIcon name="door" size="sm"/>
					Enter Room
				</NavigatorButton>
			</div>

			{/* Secondary actions */}
			<div class="flex gap-2">
				<NavigatorButton
					variant={props.isFavourite ? 'danger' : 'secondary'}
					class="flex-1"
					onClick={() => props.onToggleFavourite?.(props.roomId)}
				>
					<NavigatorIcon name={props.isFavourite ? 'heartFilled' : 'heart'} size="sm"/>
					{props.isFavourite ? 'Unfavourite' : 'Favourite'}
				</NavigatorButton>

				<NavigatorButton
					variant={props.isHome ? 'success' : 'secondary'}
					class="flex-1"
					onClick={() => props.onSetHome?.(props.roomId)}
					disabled={props.isHome}
				>
					<NavigatorIcon name="home" size="sm"/>
					{props.isHome ? 'Home Room' : 'Set as Home'} // cast: type assertion required
				</NavigatorButton>
			</div>

			{/* Rating */}
			<Show when={props.canRate}>
				<div class="flex items-center justify-center gap-2 py-2">
					<button
						type="button"
						class="p-2 rounded-lg bg-green-600/20 hover:bg-green-600/40 text-green-400 hover:text-green-300 transition-colors"
						onClick={() => props.onRate?.(props.roomId, 1)}
						title="Like this room"
					>
						<NavigatorIcon name="thumbUp" size="md"/>
					</button>
					<button
						type="button"
						class="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 transition-colors"
						onClick={() => props.onRate?.(props.roomId, -1)}
						title="Dislike this room"
					>
						<NavigatorIcon name="thumbDown" size="md"/>
					</button>
				</div>
			</Show>

			{/* Owner actions */}
			<Show when={props.canEdit || props.canDelete}>
				<div class="border-t border-slate-700 pt-3">
					<h4 class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
						Room Settings
					</h4>
					<div class="flex gap-2">
						<Show when={props.canEdit}>
							<NavigatorButton
								variant="secondary"
								class="flex-1"
								onClick={() => props.onEdit?.(props.roomId)}
							>
								<NavigatorIcon name="settings" size="sm"/>
								Edit Room
							</NavigatorButton>
						</Show>
						<Show when={props.canDelete}>
							<NavigatorButton
								variant="danger"
								class="flex-1"
								onClick={() => props.onDelete?.(props.roomId)}
							>
								<NavigatorIcon name="trash" size="sm"/>
								Delete
							</NavigatorButton>
						</Show>
					</div>
				</div>
			</Show>

			{/* Report */}
			<Show when={props.onReport}>
				<div class="flex justify-center pt-2">
					<button
						type="button"
						class="text-xs text-slate-500 hover:text-red-400 transition-colors"
						onClick={() => props.onReport?.(props.roomId)}
					>
						Report this room
					</button>
				</div>
			</Show>
		</div>
	);
}
