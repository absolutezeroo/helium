import type {JSX} from 'solid-js';
import {createSignal} from 'solid-js';
import clsx from 'clsx';
import {NavigatorIcon} from '../common';

export interface NavigatorSearchProps
{
	placeholder?: string;
	value?: string;
	onSearch?: (query: string) => void;
	onClear?: () => void;
	disabled?: boolean;
	class?: string;
}

/**
 * Navigator search input with search/clear buttons
 */
export function NavigatorSearch(props: NavigatorSearchProps): JSX.Element
{
	const [localValue, setLocalValue] = createSignal(props.value ?? '');

	const handleInput = (e: InputEvent) =>
	{
		const target = e.target as HTMLInputElement;
		setLocalValue(target.value);
	};

	const handleSubmit = (e: Event) =>
	{
		e.preventDefault();
		if (localValue().trim() && props.onSearch)
		{
			props.onSearch(localValue().trim());
		}
	};

	const handleClear = () =>
	{
		setLocalValue('');
		props.onClear?.();
	};

	const handleKeyDown = (e: KeyboardEvent) =>
	{
		if (e.key === 'Escape')
		{
			handleClear();
		}
	};

	return (
		<form
			class={clsx('relative flex items-center', props.class)}
			onSubmit={handleSubmit}
		>
			{/* Search icon */}
			<div class="absolute left-3.5 pointer-events-none flex items-center justify-center">
				<NavigatorIcon name="search" size="sm" class="text-slate-500"/>
			</div>

			{/* Input */}
			<input
				type="text"
				value={localValue()}
				onInput={handleInput}
				onKeyDown={handleKeyDown}
				placeholder={props.placeholder ?? 'Search rooms...'}
				disabled={props.disabled}
				class={clsx(
					'w-full pl-11 pr-24 py-2.5',
					'bg-slate-800/80 border border-slate-600/50 rounded-lg',
					'text-sm text-slate-200 placeholder:text-slate-500',
					'focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:bg-slate-800',
					'disabled:opacity-50 disabled:cursor-not-allowed',
					'transition-all duration-200'
				)}
			/>

			{/* Action buttons */}
			<div class="absolute right-2.5 flex items-center gap-1.5">
				{/* Clear button */}
				{localValue() && (
					<button
						type="button"
						class="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/70 transition-colors"
						onClick={handleClear}
						title="Clear search"
					>
						<NavigatorIcon name="close" size="sm"/>
					</button>
				)}

				{/* Search button */}
				<button
					type="submit"
					class={clsx(
						'p-1.5 rounded-md transition-colors',
						localValue().trim()
							? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
							: 'bg-slate-700/70 text-slate-500'
					)}
					disabled={!localValue().trim() || props.disabled}
					title="Search"
				>
					<NavigatorIcon name="arrowRight" size="sm"/>
				</button>
			</div>
		</form>
	);
}
