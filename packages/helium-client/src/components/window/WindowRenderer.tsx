import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import type {IWindow} from '@core/window/IWindow';
import {useWindow} from '../../hooks/useWindow';

/**
 * Renders a single IWindow node.
 *
 * Used internally by WindowLayerRenderer and can be used standalone.
 */
function WindowNode(props: { window: IWindow }): JSX.Element
{
	const win = props.window;

	// ── Diagnostic: identify why getters may return undefined ──
	const proto = Object.getPrototypeOf(win);
	const proto2 = proto ? Object.getPrototypeOf(proto) : null;
	const proto3 = proto2 ? Object.getPrototypeOf(proto2) : null;

	console.debug('[WindowNode] DIAGNOSTIC', {
		constructorName: win?.constructor?.name,
		protoChain: [
			proto?.constructor?.name,
			proto2?.constructor?.name,
			proto3?.constructor?.name,
		],
		ownKeys: Object.getOwnPropertyNames(win).slice(0, 20),
		hasGetterX: !!Object.getOwnPropertyDescriptor(proto, 'x')?.get,
		hasGetterType: !!Object.getOwnPropertyDescriptor(proto, 'type')?.get,
		protoHasGetterX: proto2 ? !!Object.getOwnPropertyDescriptor(proto2, 'x')?.get : 'no proto2',
		protoHasGetterType: proto2 ? !!Object.getOwnPropertyDescriptor(proto2, 'type')?.get : 'no proto2',
		directType: win.type,
		directX: win.x,
		directName: win.name,
		directVisible: win.visible,
		backing_type: (win as any)._type,
		backing_x: (win as any)._x,
		backing_name: (win as any)._name,
		backing_visible: (win as any)._visible,
		backing_children: (win as any)._children?.length,
		childrenGetter: (win as any).children?.length,
	});
	// ── End diagnostic ──

	const {x, y, width, height, visible, caption, children} = useWindow(win);

	const winType = win.type;
	const winName = win.name;

	console.debug(`[WindowNode] name="${winName}" type=${winType} visible=${visible()} pos=(${x()},${y()}) size=${width()}x${height()} children=${children().length}`);

	return (
		<Show when={visible()}>
			<div
				class={`hw-iwindow hw-type-${winType}`}
				style={{
					position: 'absolute',
					left: `${x()}px`,
					top: `${y()}px`,
					width: `${width()}px`,
					height: `${height()}px`,
				}}
				data-name={winName}
				data-type={winType}
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
