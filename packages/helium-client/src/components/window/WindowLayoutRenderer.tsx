import {For, Show} from 'solid-js';
import type {JSX} from 'solid-js';
import {getWindowComponent} from './WindowComponentRegistry';
import type {WindowElementProps} from './WindowComponentRegistry';
import type {IWindowLayoutNode} from '@habbo/window/IWindowLayout';

/**
 * Recursive renderer for a window layout tree.
 *
 * Takes a resolved IWindowLayoutNode and renders it using the
 * WindowComponentRegistry to map typeId -> SolidJS component.
 * Unknown types are rendered as a generic container with their children.
 *
 * @see sources/win63_version/habbo/window/HabboWindowManagerComponent.as
 */
export function WindowLayoutRenderer(props: WindowElementProps): JSX.Element
{
	const Component = getWindowComponent(props.node.typeId);

	return (
		<Show
			when={Component}
			fallback={<WindowFallback node={props.node} windowId={props.windowId} />}
		>
			{(Comp) =>
			{
				const C = Comp();
				return <C node={props.node} windowId={props.windowId} />;
			}}
		</Show>
	);
}

/**
 * Fallback renderer for unknown element types.
 * Renders children in a generic div with a data attribute for debugging.
 */
function WindowFallback(props: WindowElementProps): JSX.Element
{
	return (
		<div
			class="hw-unknown"
			data-tag={props.node.tag}
			data-type-id={props.node.typeId}
			style={nodePositionStyle(props.node)}
		>
			<For each={props.node.children}>
				{(child) => <WindowLayoutRenderer node={child} windowId={props.windowId} />}
			</For>
		</div>
	);
}

/**
 * Extract position/size CSS from a layout node's attributes.
 */
export function nodePositionStyle(node: IWindowLayoutNode): JSX.CSSProperties
{
	const attrs = node.attributes;
	const style: JSX.CSSProperties = {};

	if(attrs.x && attrs.x !== '0')
	{
		style.left = `${attrs.x}px`;
	}

	if(attrs.y && attrs.y !== '0')
	{
		style.top = `${attrs.y}px`;
	}

	if(attrs.width && attrs.width !== '0')
	{
		style.width = `${attrs.width}px`;
	}

	if(attrs.height && attrs.height !== '0')
	{
		style.height = `${attrs.height}px`;
	}

	if(attrs.visible === 'false')
	{
		style.display = 'none';
	}

	return style;
}

/**
 * Render children of a layout node.
 */
export function WindowChildren(props: {children: IWindowLayoutNode[]; windowId: number}): JSX.Element
{
	return (
		<For each={props.children}>
			{(child) => <WindowLayoutRenderer node={child} windowId={props.windowId} />}
		</For>
	);
}
