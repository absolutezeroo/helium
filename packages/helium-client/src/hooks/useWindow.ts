import type {Accessor} from 'solid-js';
import {createSignal, onCleanup} from 'solid-js';
import type {IWindow} from '@core/window/IWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';

/**
 * Reactive state for an IWindow element.
 */
export interface IWindowState
{
	x: Accessor<number>;
	y: Accessor<number>;
	width: Accessor<number>;
	height: Accessor<number>;
	visible: Accessor<boolean>;
	caption: Accessor<string>;
	state: Accessor<number>;
	children: Accessor<IWindow[]>;
	window: IWindow;
}

/**
 * SolidJS hook that observes an IWindow and creates reactive signals
 * for its visual properties.
 *
 * Listens to WindowEvent types (WE_RELOCATED, WE_RESIZED, WE_CHILD_ADDED,
 * WE_CHILD_REMOVED, etc.) and updates signals accordingly.
 *
 * @param win - The IWindow to observe
 * @returns Reactive state object
 */
export function useWindow(win: IWindow): IWindowState
{
	const [x, setX] = createSignal(win.x);
	const [y, setY] = createSignal(win.y);
	const [width, setWidth] = createSignal(win.width);
	const [height, setHeight] = createSignal(win.height);
	const [visible, setVisible] = createSignal(win.visible);
	const [caption, setCaption] = createSignal(win.caption);
	const [children, setChildren] = createSignal<IWindow[]>(getChildren(win));
	const [state, setState] = createSignal(win.state);

	const onRelocated = (): void =>
	{
		setX(win.x);
		setY(win.y);
	};

	const onResized = (): void =>
	{
		setWidth(win.width);
		setHeight(win.height);
	};

	const onChildChanged = (): void =>
	{
		setChildren(getChildren(win));
	};

	const onStateChanged = (): void =>
	{
		setVisible(win.visible);
		setCaption(win.caption);
		setState(win.state);
	};

	win.addEventListener(WindowEvent.WE_RELOCATED, onRelocated);
	win.addEventListener(WindowEvent.WE_RESIZED, onResized);
	win.addEventListener(WindowEvent.WE_CHILD_ADDED, onChildChanged);
	win.addEventListener(WindowEvent.WE_CHILD_REMOVED, onChildChanged);
	win.addEventListener(WindowEvent.WE_ACTIVATED, onStateChanged);
	win.addEventListener(WindowEvent.WE_DEACTIVATED, onStateChanged);
	win.addEventListener(WindowEvent.WE_ENABLED, onStateChanged);
	win.addEventListener(WindowEvent.WE_DISABLED, onStateChanged);

	onCleanup(() =>
	{
		if (!win.disposed)
		{
			win.removeEventListener(WindowEvent.WE_RELOCATED, onRelocated);
			win.removeEventListener(WindowEvent.WE_RESIZED, onResized);
			win.removeEventListener(WindowEvent.WE_CHILD_ADDED, onChildChanged);
			win.removeEventListener(WindowEvent.WE_CHILD_REMOVED, onChildChanged);
			win.removeEventListener(WindowEvent.WE_ACTIVATED, onStateChanged);
			win.removeEventListener(WindowEvent.WE_DEACTIVATED, onStateChanged);
			win.removeEventListener(WindowEvent.WE_ENABLED, onStateChanged);
			win.removeEventListener(WindowEvent.WE_DISABLED, onStateChanged);
		}
	});

	return {x, y, width, height, visible, caption, state, children, window: win};
}

/**
 * Extracts children from an IWindow safely.
 */
function getChildren(win: IWindow): IWindow[]
{
	const container = win as IWindow & { children?: IWindow[] | null; numChildren?: number };

	if (container.children)
	{
		return [...container.children];
	}

	return [];
}
