import type {JSX} from 'solid-js';
import {Show, createSignal, onCleanup} from 'solid-js';
import clsx from 'clsx';
import {NavigatorIcon} from '../common';
import {useNavigatorLocalization} from '../hooks';

export type DoorbellStatus = 'waiting' | 'accepted' | 'denied' | 'no_answer';

export interface DoorbellModalProps
{
	isOpen: boolean;
	roomName: string;
	roomId: number;
	status?: DoorbellStatus;
	onCancel?: () => void;
	class?: string;
}

/**
 * Doorbell modal - shown when waiting for room entry approval
 */
export function DoorbellModal(props: DoorbellModalProps): JSX.Element
{
	const {t, keys} = useNavigatorLocalization();
	const [dots, setDots] = createSignal('');

	// Animate waiting dots
	const interval = setInterval(() =>
	{
		setDots(d => d.length >= 3 ? '' : d + '.');
	}, 500);

	onCleanup(() => clearInterval(interval));

	const getStatusIcon = () =>
	{
		switch (props.status)
		{
			case 'accepted':
				return 'check';
			case 'denied':
				return 'close';
			case 'no_answer':
				return 'clock';
			default:
				return 'doorbell';
		}
	};

	const getStatusColor = () =>
	{
		switch (props.status)
		{
			case 'accepted':
				return 'text-green-400';
			case 'denied':
				return 'text-red-400';
			case 'no_answer':
				return 'text-yellow-400';
			default:
				return 'text-amber-400';
		}
	};

	const getStatusText = () =>
	{
		switch (props.status)
		{
			case 'accepted':
				return t(keys.DOORBELL_ACCEPTED);
			case 'denied':
				return t(keys.DOORBELL_DENIED);
			case 'no_answer':
				return t(keys.DOORBELL_NO_ANSWER);
			default:
				return `${t(keys.DOORBELL_WAITING)}${dots()}`;
		}
	};

	return (
		<Show when={props.isOpen}>
			{/* Backdrop */}
			<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
				{/* Modal */}
				<div
					class={clsx(
						'w-[320px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden',
						props.class
					)}
				>
					{/* Header */}
					<div class="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
						<h3 class="text-sm font-semibold text-slate-200">{t(keys.DOORBELL_TITLE)}</h3>
					</div>

					{/* Content */}
					<div class="p-6 flex flex-col items-center text-center">
						{/* Animated icon */}
						<div
							class={clsx(
								'w-16 h-16 rounded-full flex items-center justify-center mb-4',
								props.status === 'waiting' && 'animate-pulse',
								props.status === 'accepted' ? 'bg-green-500/20' :
									props.status === 'denied' ? 'bg-red-500/20' :
										props.status === 'no_answer' ? 'bg-yellow-500/20' : 'bg-amber-500/20'
							)}
						>
							<NavigatorIcon
								name={getStatusIcon()}
								size="xl"
								class={getStatusColor()}
							/>
						</div>

						{/* Room name */}
						<p class="text-sm text-slate-400 mb-2">
							{t(keys.DOORBELL_ENTERING)}
						</p>
						<p class="text-base font-medium text-slate-200 mb-4">
							{props.roomName}
						</p>

						{/* Status text */}
						<p class={clsx('text-sm font-medium', getStatusColor())}>
							{getStatusText()}
						</p>
					</div>

					{/* Actions */}
					<div class="px-4 py-3 bg-slate-800/30 border-t border-slate-700">
						<button
							type="button"
							class={clsx(
								'w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors',
								'bg-slate-700 hover:bg-slate-600 text-slate-200'
							)}
							onClick={props.onCancel}
						>
							{t(keys.DOORBELL_CANCEL)}
						</button>
					</div>
				</div>
			</div>
		</Show>
	);
}
