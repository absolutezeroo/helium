import type {JSX} from 'solid-js';
import {createSignal, Show} from 'solid-js';
import clsx from 'clsx';
import {NavigatorIcon} from '../common';
import {useNavigatorLocalization} from '../hooks';

export interface PasswordModalProps
{
	isOpen: boolean;
	roomName: string;
	roomId: number;
	error?: string;
	loading?: boolean;
	onSubmit?: (password: string) => void;
	onCancel?: () => void;
	class?: string;
}

/**
 * Password modal - shown when entering a password-protected room
 */
export function PasswordModal(props: PasswordModalProps): JSX.Element
{
	const {t, keys} = useNavigatorLocalization();
	const [password, setPassword] = createSignal('');
	const [showPassword, setShowPassword] = createSignal(false);

	const handleSubmit = (e: Event) =>
	{
		e.preventDefault();
		if (password().trim() && !props.loading)
		{
			props.onSubmit?.(password());
		}
	};

	const handleKeyDown = (e: KeyboardEvent) =>
	{
		if (e.key === 'Enter')
		{
			handleSubmit(e);
		}
		if (e.key === 'Escape')
		{
			props.onCancel?.();
		}
	};

	return (
		<Show when={props.isOpen}>
			{/* Backdrop */}
			<div
				class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
				onClick={(e) =>
				{
					if (e.target === e.currentTarget) props.onCancel?.();
				}}
			>
				{/* Modal */}
				<div
					class={clsx(
						'w-[360px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden',
						props.class
					)}
				>
					{/* Header */}
					<div class="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<NavigatorIcon name="lock" size="sm" class="text-amber-400"/>
							<h3 class="text-sm font-semibold text-slate-200">{t(keys.PASSWORD_TITLE)}</h3>
						</div>
						<button
							type="button"
							class="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
							onClick={props.onCancel}
						>
							<NavigatorIcon name="close" size="sm"/>
						</button>
					</div>

					{/* Content */}
					<form onSubmit={handleSubmit} class="p-4">
						{/* Room name */}
						<div class="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
							<p class="text-xs text-slate-500 mb-1">Entering room:</p>
							<p class="text-sm font-medium text-slate-200">{props.roomName}</p>
						</div>

						{/* Password input */}
						<div class="mb-4">
							<label class="block text-xs text-slate-400 mb-2">
								{t(keys.PASSWORD_ENTER)}
							</label>
							<div class="relative">
								<input
									type={showPassword() ? 'text' : 'password'}
									value={password()}
									onInput={(e) => setPassword(e.currentTarget.value)}
									onKeyDown={handleKeyDown}
									placeholder={t(keys.PASSWORD_PLACEHOLDER)}
									disabled={props.loading}
									class={clsx(
										'w-full px-3 py-2.5 pr-10',
										'bg-slate-800 border rounded-lg',
										'text-sm text-slate-200 placeholder-slate-500',
										'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
										'transition-colors',
										props.error
											? 'border-red-500/50 focus:border-red-500'
											: 'border-slate-600 focus:border-amber-500'
									)}
									autofocus
								/>
								<button
									type="button"
									class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
									onClick={() => setShowPassword(!showPassword())}
								>
									<NavigatorIcon name={showPassword() ? 'hidden' : 'eye'} size="sm"/>
								</button>
							</div>

							{/* Error message */}
							<Show when={props.error}>
								<p class="mt-2 text-xs text-red-400 flex items-center gap-1">
									<NavigatorIcon name="warning" size="xs"/>
									{props.error}
								</p>
							</Show>
						</div>

						{/* Actions */}
						<div class="flex gap-2">
							<button
								type="button"
								class={clsx(
									'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors',
									'bg-slate-700 hover:bg-slate-600 text-slate-200'
								)}
								onClick={props.onCancel}
								disabled={props.loading}
							>
								{t(keys.PASSWORD_CANCEL)}
							</button>
							<button
								type="submit"
								class={clsx(
									'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors',
									'bg-amber-600 hover:bg-amber-500 text-white',
									'disabled:opacity-50 disabled:cursor-not-allowed',
									'flex items-center justify-center gap-2'
								)}
								disabled={!password().trim() || props.loading}
							>
								<Show when={props.loading}>
									<NavigatorIcon name="loading" size="sm" class="animate-spin"/>
								</Show>
								{props.loading ? t(keys.PASSWORD_ENTERING) : t(keys.PASSWORD_SUBMIT)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</Show>
	);
}
