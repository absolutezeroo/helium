import type {JSX} from 'solid-js';
import {createSignal, For, Show} from 'solid-js';
import {NavigatorButton, NavigatorIcon} from '../common';

export interface RoomCategory
{
	id: number;
	name: string;
}

export interface RoomModel
{
	id: number;
	name: string;
	tileSize: number;
	doorX?: number;
	doorY?: number;
}

export interface RoomCreateFormData
{
	name: string;
	description: string;
	categoryId: number;
	modelId: number;
	maxUsers: number;
	tradeMode: number;
}

export interface RoomCreateFormProps
{
	categories: RoomCategory[];
	models: RoomModel[];
	maxRoomNameLength?: number;
	maxDescriptionLength?: number;
	onSubmit?: (data: RoomCreateFormData) => void;
	onCancel?: () => void;
	loading?: boolean;
	error?: string;
	class?: string;
}

const MAX_USERS_OPTIONS = [10, 15, 20, 25, 50, 75, 100];
const TRADE_MODES = [
	{value: 0, label: 'No trading'},
	{value: 1, label: 'Trading allowed'},
	{value: 2, label: 'Room owner only'},
];

/**
 * Room create form - form fields for creating a new room
 */
export function RoomCreateForm(props: RoomCreateFormProps): JSX.Element
{
	const maxNameLength = () => props.maxRoomNameLength ?? 60;
	const maxDescLength = () => props.maxDescriptionLength ?? 255;

	const [name, setName] = createSignal('');
	const [description, setDescription] = createSignal('');
	const [categoryId, setCategoryId] = createSignal<number>(props.categories[0]?.id ?? 0);
	const [modelId, setModelId] = createSignal<number>(props.models[0]?.id ?? 0);
	const [maxUsers, setMaxUsers] = createSignal(25);
	const [tradeMode, setTradeMode] = createSignal(0);

	const canSubmit = () =>
	{
		return name().trim().length > 0 &&
			name().length <= maxNameLength() &&
			description().length <= maxDescLength() &&
			categoryId() > 0 &&
			modelId() > 0 &&
			!props.loading;
	};

	const handleSubmit = (e: Event) =>
	{
		e.preventDefault();
		if (!canSubmit()) return;

		props.onSubmit?.({
			name: name().trim(),
			description: description().trim(),
			categoryId: categoryId(),
			modelId: modelId(),
			maxUsers: maxUsers(),
			tradeMode: tradeMode(),
		});
	};

	return (
		<form
			class={`space-y-4 ${props.class ?? ''}`}
			onSubmit={handleSubmit}
		>
			{/* Error message */}
			<Show when={props.error}>
				<div
					class="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
					<NavigatorIcon name="warning" size="sm"/>
					{props.error}
				</div>
			</Show>

			{/* Room name */}
			<div>
				<label class="block text-sm font-medium text-slate-300 mb-1">
					Room Name *
				</label>
				<input
					type="text"
					value={name()}
					onInput={(e) => setName(e.currentTarget.value)}
					maxLength={maxNameLength()}
					placeholder="Enter room name..."
					class={`
                        w-full px-3 py-2
                        bg-slate-800 border border-slate-700
                        rounded-lg
                        text-sm text-slate-200
                        placeholder:text-slate-500
                        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                        transition-colors
                    `}
					disabled={props.loading}
				/>
				<div class="flex justify-end mt-1">
                    <span class={`text-xs ${name().length > maxNameLength() ? 'text-red-400' : 'text-slate-500'}`}>
                        {name().length}/{maxNameLength()}
                    </span>
				</div>
			</div>

			{/* Description */}
			<div>
				<label class="block text-sm font-medium text-slate-300 mb-1">
					Description
				</label>
				<textarea
					value={description()}
					onInput={(e) => setDescription(e.currentTarget.value)}
					maxLength={maxDescLength()}
					placeholder="Enter room description..."
					rows={3}
					class={`
                        w-full px-3 py-2
                        bg-slate-800 border border-slate-700
                        rounded-lg
                        text-sm text-slate-200
                        placeholder:text-slate-500
                        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                        resize-none
                        transition-colors
                    `}
					disabled={props.loading}
				/>
				<div class="flex justify-end mt-1">
                    <span
						class={`text-xs ${description().length > maxDescLength() ? 'text-red-400' : 'text-slate-500'}`}>
                        {description().length}/{maxDescLength()}
                    </span>
				</div>
			</div>

			{/* Category */}
			<div>
				<label class="block text-sm font-medium text-slate-300 mb-1">
					Category *
				</label>
				<select
					value={categoryId()}
					onChange={(e) => setCategoryId(parseInt(e.currentTarget.value))}
					class={`
                        w-full px-3 py-2
                        bg-slate-800 border border-slate-700
                        rounded-lg
                        text-sm text-slate-200
                        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                        transition-colors
                    `}
					disabled={props.loading}
				>
					<For each={props.categories}>
						{(cat) => (
							<option value={cat.id}>{cat.name}</option>
						)}
					</For>
				</select>
			</div>

			{/* Room model */}
			<div>
				<label class="block text-sm font-medium text-slate-300 mb-1">
					Room Layout *
				</label>
				<div class="grid grid-cols-4 gap-2">
					<For each={props.models}>
						{(model) => (
							<button
								type="button"
								class={`
                                    flex flex-col items-center justify-center
                                    p-2 rounded-lg border
                                    transition-colors
                                    ${modelId() === model.id
									? 'bg-blue-600/20 border-blue-500 text-blue-300'
									: 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
								}
                                `}
								onClick={() => setModelId(model.id)}
								disabled={props.loading}
							>
								<NavigatorIcon name="room" size="md"/>
								<span class="text-xs mt-1">{model.name}</span>
							</button>
						)}
					</For>
				</div>
			</div>

			{/* Max users */}
			<div>
				<label class="block text-sm font-medium text-slate-300 mb-1">
					Max Users
				</label>
				<select
					value={maxUsers()}
					onChange={(e) => setMaxUsers(parseInt(e.currentTarget.value))}
					class={`
                        w-full px-3 py-2
                        bg-slate-800 border border-slate-700
                        rounded-lg
                        text-sm text-slate-200
                        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                        transition-colors
                    `}
					disabled={props.loading}
				>
					<For each={MAX_USERS_OPTIONS}>
						{(num) => (
							<option value={num}>{num} users</option>
						)}
					</For>
				</select>
			</div>

			{/* Trade mode */}
			<div>
				<label class="block text-sm font-medium text-slate-300 mb-1">
					Trading
				</label>
				<select
					value={tradeMode()}
					onChange={(e) => setTradeMode(parseInt(e.currentTarget.value))}
					class={`
                        w-full px-3 py-2
                        bg-slate-800 border border-slate-700
                        rounded-lg
                        text-sm text-slate-200
                        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                        transition-colors
                    `}
					disabled={props.loading}
				>
					<For each={TRADE_MODES}>
						{(mode) => (
							<option value={mode.value}>{mode.label}</option>
						)}
					</For>
				</select>
			</div>

			{/* Actions */}
			<div class="flex gap-3 pt-4 border-t border-slate-700">
				<NavigatorButton
					variant="secondary"
					class="flex-1"
					onClick={props.onCancel}
					disabled={props.loading}
				>
					Cancel
				</NavigatorButton>
				<NavigatorButton
					type="submit"
					variant="primary"
					class="flex-1"
					disabled={!canSubmit()}
				>
					<Show when={props.loading}>
						<NavigatorIcon name="loading" size="sm" class="animate-spin"/>
					</Show>
					{props.loading ? 'Creating...' : 'Create Room'}
				</NavigatorButton>
			</div>
		</form>
	);
}
