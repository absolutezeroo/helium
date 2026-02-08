import {createSignal} from 'solid-js';
import type {Accessor, Setter} from 'solid-js';

/**
 * SolidJS hook for persistent local storage state.
 *
 * Creates a signal that is backed by localStorage.
 * On init, reads the stored value (or falls back to `initialValue`).
 * On set, persists the new value to localStorage.
 *
 * @param key - localStorage key
 * @param initialValue - Default value if nothing stored
 * @returns [getter, setter] tuple (like createSignal)
 *
 * @see source_nitro_react/src/hooks/useLocalStorage.ts
 *
 * @example
 * ```tsx
 * const [volume, setVolume] = useLocalStorage('helium.sound.volume', 50);
 * ```
 */
export function useLocalStorage<T>(key: string, initialValue: T): [Accessor<T>, Setter<T>]
{
	const [value, setValue] = createSignal<T>(readFromStorage(key, initialValue));

	const setAndPersist = ((next: T | ((prev: T) => T)) =>
	{
		const resolved = typeof next === 'function'
			? (next as (prev: T) => T)(value())
			: next;

		try
		{
			window.localStorage.setItem(key, JSON.stringify(resolved));
		}
		catch
		{
			// Ignore quota errors
		}

		return (setValue as Setter<T>)(resolved as any);
	}) as Setter<T>;

	return [value, setAndPersist];
}

function readFromStorage<T>(key: string, fallback: T): T
{
	try
	{
		const raw = window.localStorage.getItem(key);

		if (raw !== null)
		{
			return JSON.parse(raw) as T;
		}
	}
	catch
	{
		// Ignore parse errors
	}

	return fallback;
}

/**
 * Read a value from localStorage without creating a signal.
 */
export function getLocalStorage<T>(key: string): T | null
{
	try
	{
		const raw = window.localStorage.getItem(key);

		if (raw !== null)
		{
			return JSON.parse(raw) as T;
		}
	}
	catch
	{
		// Ignore parse errors
	}

	return null;
}

/**
 * Write a value to localStorage.
 */
export function setLocalStorage<T>(key: string, value: T): void
{
	try
	{
		window.localStorage.setItem(key, JSON.stringify(value));
	}
	catch
	{
		// Ignore quota errors
	}
}
