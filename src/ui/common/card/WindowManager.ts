/**
 * WindowManager - Global z-index stacking for draggable windows.
 *
 * Manages a stack of window keys so that the most recently focused
 * window always appears on top.
 */

const BASE_Z_INDEX = 100;
const WINDOW_STACK: string[] = [];

export const WindowManager =
{
	register(key: string): void
	{
		if (!WINDOW_STACK.includes(key))
		{
			WINDOW_STACK.push(key);
		}
	},

	unregister(key: string): void
	{
		const idx = WINDOW_STACK.indexOf(key);

		if (idx !== -1)
		{
			WINDOW_STACK.splice(idx, 1);
		}
	},

	bringToFront(key: string): void
	{
		const idx = WINDOW_STACK.indexOf(key);

		if (idx !== -1)
		{
			WINDOW_STACK.splice(idx, 1);
		}

		WINDOW_STACK.push(key);
	},

	getZIndex(key: string): number
	{
		const idx = WINDOW_STACK.indexOf(key);

		return BASE_Z_INDEX + (idx === -1 ? 0 : idx + 1);
	},

	getStack(): readonly string[]
	{
		return WINDOW_STACK;
	},
};
