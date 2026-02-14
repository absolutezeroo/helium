import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Drag bar element — acts as a drag handle for its parent window.
 *
 * Also handles minimize/maximize/restore box types.
 */
export function WindowDragbar(props: WindowElementProps): JSX.Element
{
	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		base.cursor = 'move';
		return base;
	};

	return (
		<div
			class={`hw-dragbar hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
		>
			<WindowChildren children={props.node.children} windowId={props.windowId} />
		</div>
	);
}

registerWindowComponents([
	WindowElementType.DRAGBAR,
	WindowElementType.MINIMIZEBOX,
	WindowElementType.MAXIMIZEBOX,
	WindowElementType.RESTOREBOX,
], WindowDragbar);
