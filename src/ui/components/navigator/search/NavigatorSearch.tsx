import type {JSX} from 'solid-js';
import {createSignal} from 'solid-js';
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
			class={`relative flex items-center ${props.class ?? ''}`}
			onSubmit={handleSubmit}
		>
			{/* Search icon */}
			<div class="absolute left-3 pointer-events-none">
				<NavigatorIcon name="search" size="sm" class="text-slate-400"/>
			</div>

			{/* Input */}
			<input
				type="text"
				value={localValue()}
				onInput={handleInput}
				onKeyDown={handleKeyDown}
				placeholder={props.placeholder ?? 'Search rooms...'}
				disabled={props.disabled}
				class={`
                    w-full pl-10 pr-20 py-2
                    bg-slate-800 border border-slate-700
                    rounded-lg
                    text-sm text-slate-200
                    placeholder:text-slate-500
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                `}
			/>

			{/* Action buttons */}
			<div class="absolute right-2 flex items-center gap-1">
				{/* Clear button */}
				{localValue() && (
					<button
						type="button"
						class="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
						onClick={handleClear}
						title="Clear search"
					>
						<NavigatorIcon name="close" size="sm"/>
					</button>
				)}

				{/* Search button */}
				<button
					type="submit"
					class={`
                        p-1.5 rounded
                        ${localValue().trim()
						? 'bg-blue-600 hover:bg-blue-500 text-white'
						: 'bg-slate-700 text-slate-400'
					}
                        transition-colors
                    `}
					disabled={!localValue().trim() || props.disabled}
					title="Search"
				>
					<NavigatorIcon name="arrowRight" size="sm"/>
				</button>
			</div>
		</form>
	);
}
