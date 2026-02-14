import {createSignal, onMount, onCleanup, Show} from 'solid-js';
import type {JSX} from 'solid-js';
import {WindowLayoutParser} from '@habbo/window/WindowLayoutParser';
import {WindowManagerEvents} from '@habbo/window/IHabboWindowManager';
import type {IWindowLayoutNode, IWindowLayout} from '@habbo/window/IWindowLayout';
import {WindowLayoutRenderer} from '../window/WindowLayoutRenderer';
import {getToolbar} from '../../stores/toolbarStore';
import {getWindowManager} from '../../stores/windowStore';

/**
 * ToolbarView — Pure bridge between the window layout system and the engine toolbar.
 *
 * Loads `toolbar_view_squeezed.json` and renders it via the WindowLayoutRenderer.
 * On region click, forwards to `toolbar.toggleWindowVisibility(name)`.
 *
 * This is NOT a managed window — it's positioned fixed on the right side of the screen.
 *
 * @see sources/win63_2021_version/com/sulake/habbo/toolbar/ToolbarView.as
 */
export function ToolbarView(): JSX.Element
{
	const [layoutTree, setLayoutTree] = createSignal<IWindowLayoutNode | null>(null);

	// Stable window ID for the toolbar (not managed by windowManager, rendered directly)
	const TOOLBAR_WINDOW_ID = -1;

	onMount(async () =>
	{
		try
		{
			const layoutModule = await import('../../assets/window-layouts/toolbar_view_squeezed.json');
			const layout: IWindowLayout = 'default' in layoutModule ? layoutModule.default : layoutModule;

			const resolved = WindowLayoutParser.resolve(layout);

			setLayoutTree(resolved);
		}
		catch(error)
		{
			console.warn('[ToolbarView] Failed to load toolbar layout:', error);
		}

		// Listen for element clicks from the window system
		const manager = getWindowManager();

		if(manager)
		{
			manager.windowEvents.on(WindowManagerEvents.WINDOW_ELEMENT_CLICK, onElementClick);
		}
	});

	onCleanup(() =>
	{
		const manager = getWindowManager();

		if(manager)
		{
			manager.windowEvents.off(WindowManagerEvents.WINDOW_ELEMENT_CLICK, onElementClick);
		}
	});

	/**
	 * Bridge: region click → engine toolbar
	 *
	 * In AS3, ToolbarView attached WME_CLICK listeners to TOGGLE-tagged regions
	 * and forwarded clicks to toolbar.toggleWindowVisibility(name).
	 * We do the same via the WINDOW_ELEMENT_CLICK event.
	 */
	const onElementClick = (data: { windowId: number; elementName: string }): void =>
	{
		// Only handle clicks from the toolbar (windowId = -1)
		if(data.windowId !== TOOLBAR_WINDOW_ID) return;

		const toolbar = getToolbar();

		if(!toolbar) return;

		// Forward to the engine — the engine dispatches TOOLBAR_CLICK event
		// which other views (NavigatorView, etc.) listen for
		toolbar.toggleWindowVisibility(data.elementName);
	};

	return (
		<div class="hb-toolbar">
			<Show when={layoutTree()}>
				{(tree) => (
					<WindowLayoutRenderer node={tree()} windowId={TOOLBAR_WINDOW_ID} />
				)}
			</Show>
		</div>
	);
}
