import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Border element.
 */
export function WindowBorder(props: WindowElementProps): JSX.Element
{
	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		return base;
	};

	return (
		<div
			class={`hw-border hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
		>
			<WindowChildren children={props.node.children} windowId={props.windowId} />
		</div>
	);
}

registerWindowComponents([
	WindowElementType.BORDER,
	WindowElementType.BORDER_THIN,
	WindowElementType.BORDER_THICK,
	WindowElementType.BORDER_NOTIFY,
	WindowElementType.BUBBLE,
	WindowElementType.BUBBLE_POINTER_UP,
	WindowElementType.BUBBLE_POINTER_RIGHT,
	WindowElementType.BUBBLE_POINTER_DOWN,
	WindowElementType.BUBBLE_POINTER_LEFT,
], WindowBorder);
