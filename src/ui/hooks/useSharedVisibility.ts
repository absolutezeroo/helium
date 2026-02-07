import type {Accessor} from 'solid-js';
import {createSignal} from 'solid-js';

/**
 * Centralized open/close state for windows.
 *
 * @example
 * ```tsx
 * const { isVisible, show, hide, toggle } = useSharedVisibility();
 * ```
 */
export function useSharedVisibility(initialVisible: boolean = false)
{
	const [isVisible, setIsVisible] = createSignal(initialVisible);

	return {
		isVisible: isVisible as Accessor<boolean>,
		show: () => setIsVisible(true),
		hide: () => setIsVisible(false),
		toggle: () => setIsVisible(v => !v),
	};
}
