import { Show, For } from 'solid-js';
import type { JSX } from 'solid-js';
import type { IWindow } from '@core/window/IWindow';
import { useWindow } from '../../hooks/useWindow';

/**
 * Renders a single IWindow node.
 *
 * Used internally by WindowLayerRenderer and can be used standalone.
 */
function WindowNode(props: { window: IWindow }): JSX.Element
{
	const { x, y, width, height, visible, caption, children } = useWindow(props.window);

	return (
		<Show when={visible()}>
			<div
				class={`hw-iwindow hw-type-${props.window.type}`}
				style={{
					position: 'absolute',
					left: `${x()}px`,
					top: `${y()}px`,
					width: `${width()}px`,
					height: `${height()}px`,
				}}
				data-name={props.window.name}
				data-type={props.window.type}
			>
				<Show when={caption()}>
					<span class="hw-caption">{caption()}</span>
				</Show>
				<For each={children()}>
					{(child) => <WindowNode window={child} />}
				</For>
			</div>
		</Show>
	);
}

/**
 * Recursive SolidJS component that renders an IWindow and its children to DOM.
 *
 * When called without a window prop (e.g. at the App root), renders nothing.
 * When given a window, renders it and all its children recursively.
 * Reactive signals from useWindow ensure the DOM stays in sync with
 * engine-side property changes.
 */
export function WindowRenderer(props: { window?: IWindow }): JSX.Element
{
	return (
		<Show when={props.window}>
			{(win) => <WindowNode window={win()} />}
		</Show>
	);
}
