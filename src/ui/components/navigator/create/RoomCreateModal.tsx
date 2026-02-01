import type {JSX} from 'solid-js';
import {Show} from 'solid-js';
import {NavigatorHeader} from '../common';
import type {RoomCategory, RoomCreateFormData, RoomModel} from './RoomCreateForm';
import {RoomCreateForm} from './RoomCreateForm';

export interface RoomCreateModalProps
{
	isOpen: boolean;
	categories: RoomCategory[];
	models: RoomModel[];
	loading?: boolean;
	error?: string;
	onSubmit?: (data: RoomCreateFormData) => void;
	onClose?: () => void;
	class?: string;
}

/**
 * Room create modal - modal dialog for creating a new room
 */
export function RoomCreateModal(props: RoomCreateModalProps): JSX.Element
{
	const handleBackdropClick = (e: MouseEvent) =>
	{
		if (e.target === e.currentTarget)
		{
			props.onClose?.();
		}
	};

	return (
		<Show when={props.isOpen}>
			{/* Backdrop */}
			<div
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
				onClick={handleBackdropClick}
			>
				{/* Modal */}
				<div
					class={`
                        w-full max-w-md
                        bg-slate-900 border border-slate-700
                        rounded-xl shadow-2xl
                        overflow-hidden
                        animate-in fade-in zoom-in-95 duration-200
                        ${props.class ?? ''}
                    `}
				>
					{/* Header */}
					<NavigatorHeader
						title="Create Room"
						icon="plus"
						onClose={props.onClose}
					/>

					{/* Form */}
					<div class="p-4 max-h-[70vh] overflow-y-auto">
						<RoomCreateForm
							categories={props.categories}
							models={props.models}
							loading={props.loading}
							error={props.error}
							onSubmit={props.onSubmit}
							onCancel={props.onClose}
						/>
					</div>
				</div>
			</div>
		</Show>
	);
}
