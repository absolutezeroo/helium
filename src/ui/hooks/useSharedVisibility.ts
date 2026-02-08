import {createSignal} from 'solid-js';
import type {Accessor} from 'solid-js';

/**
 * SolidJS hook for tracking shared visibility across multiple consumers.
 *
 * Each consumer can `activate()` to get a unique ID, then `deactivate(id)` to release it.
 * `isVisible` is true as long as at least one consumer is active.
 *
 * @see source_nitro_react/src/hooks/useSharedVisibility.ts
 *
 * @example
 * ```tsx
 * const { isVisible, activate, deactivate } = useSharedVisibility();
 *
 * const id = activate();
 * // isVisible() === true
 *
 * deactivate(id);
 * // isVisible() === false (if no other activations)
 * ```
 */
export function useSharedVisibility(): {
	isVisible: Accessor<boolean>;
	activate: () => number;
	deactivate: (id: number) => void;
}
{
	const [activeIds, setActiveIds] = createSignal<number[]>([]);

	const isVisible = () => activeIds().length > 0;

	const activate = (): number =>
	{
		let id = -1;

		setActiveIds((prev) =>
		{
			const next = [...prev];
			id = next.length ? next[next.length - 1] + 1 : 0;
			next.push(id);
			return next;
		});

		return id;
	};

	const deactivate = (id: number): void =>
	{
		setActiveIds((prev) =>
		{
			const index = prev.indexOf(id);

			if (index === -1) return prev;

			const next = [...prev];
			next.splice(index, 1);
			return next;
		});
	};

	return {isVisible, activate, deactivate};
}
