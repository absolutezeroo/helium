import type {Accessor} from 'solid-js';
import {createSignal} from 'solid-js';

/**
 * Shell hook for future Friends module.
 * Will be connected when the friendlist module is implemented.
 *
 * @example
 * ```tsx
 * const { friends, onlineCount } = useFriends();
 * ```
 */
export function useFriends()
{
	const [friends] = createSignal<unknown[]>([]);
	const [onlineCount] = createSignal(0);

	return {
		friends: friends as Accessor<unknown[]>,
		onlineCount: onlineCount as Accessor<number>,
	};
}
