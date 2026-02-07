import {createSignal} from 'solid-js';
import type {Accessor} from 'solid-js';

/**
 * SolidJS signal synchronized with localStorage.
 *
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage('ui.theme', 'dark');
 * ```
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [Accessor<T>, (v: T) => void]
{
	const stored = localStorage.getItem(key);
	let initial = defaultValue;

	if (stored !== null)
	{
		try
		{
			initial = JSON.parse(stored) as T;
		}
		catch
		{
			// Ignore parse errors, use default
		}
	}

	const [value, setValue] = createSignal<T>(initial);

	const set = (v: T) =>
	{
		setValue(() => v);

		try
		{
			localStorage.setItem(key, JSON.stringify(v));
		}
		catch
		{
			// Ignore storage errors (quota exceeded, etc.)
		}
	};

	return [value, set];
}
