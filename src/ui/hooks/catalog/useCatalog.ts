import type {Accessor} from 'solid-js';
import {createSignal} from 'solid-js';

/**
 * Shell hook for future Catalog module.
 * Will be connected when the catalog module is implemented.
 *
 * @example
 * ```tsx
 * const { isOpen, currentPage } = useCatalog();
 * ```
 */
export function useCatalog()
{
	const [isOpen] = createSignal(false);
	const [currentPage] = createSignal<unknown>(null);

	return {
		isOpen: isOpen as Accessor<boolean>,
		currentPage: currentPage as Accessor<unknown>,
	};
}
