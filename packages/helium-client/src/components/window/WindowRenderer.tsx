import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import type {IWindow} from '@core/window/IWindow';
import {useWindow} from '../../hooks/useWindow';
import {useWindowSkin} from '../../hooks/useWindowSkin';
import {useElementRegistry} from '../../api/windowSkinContext';

/**
 * Renders a single IWindow node.
 *
 * Applies the resolved skin background from the canvas 9-slice renderer.
 * Used internally by WindowLayerRenderer and can be used standalone.
 */
function WindowNode(props: { window: IWindow }): JSX.Element
{
	const win = props.window;
	const {x, y, width, height, visible, caption, state, children} = useWindow(win);

	let registry: ReturnType<typeof useElementRegistry> | null = null;

	try
	{
		registry = useElementRegistry();
	}
	catch
	{
		// No registry available — render without skins
	}

	const background = registry
		? useWindowSkin(win, registry, width, height, state)
		: () => null;

	const backgroundStyle = (): Record<string, string | undefined> =>
	{
		const bg = background();

		if(!bg) return {};

		// url(...) → background-image, rgb(...) → background-color
		if(bg.startsWith('url('))
		{
			return { 'background-image': bg };
		}

		return { 'background-color': bg };
	};

	return (
		<Show when={visible()}>
			<div
				class={`hw-iwindow hw-type-${win.type}`}
				style={{
					position: 'absolute',
					left: `${x()}px`,
					top: `${y()}px`,
					width: `${width()}px`,
					height: `${height()}px`,
					...backgroundStyle(),
				}}
				data-name={win.name}
				data-type={win.type}
			>
				<Show when={caption()}>
					<span class="hw-caption">{caption()}</span>
				</Show>
				<For each={children()}>
					{(child) => <WindowNode window={child}/>}
				</For>
			</div>
		</Show>
	);
}

/**
 * Recursive SolidJS component that renders an IWindow and its children to DOM.
 *
 * When called without a window prop (e.g., at the App root), renders nothing.
 * When given a window, renders it and all its children recursively.
 * Reactive signals from useWindow ensure the DOM stays in sync with
 * engine-side property changes.
 */
export function WindowRenderer(props: { window?: IWindow }): JSX.Element
{
	if(!props.window) return null as unknown as JSX.Element;

	return <WindowNode window={props.window}/>;
}
