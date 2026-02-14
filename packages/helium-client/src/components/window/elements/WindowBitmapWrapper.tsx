import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Bitmap / image wrapper element.
 *
 * Handles BITMAP_WRAPPER and STATIC_BITMAP_WRAPPER types.
 */
export function WindowBitmapWrapper(props: WindowElementProps): JSX.Element
{
	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		return base;
	};

	return (
		<div
			class={`hw-bitmap hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
		>
			<WindowChildren children={props.node.children} windowId={props.windowId} />
		</div>
	);
}

registerWindowComponents([
	WindowElementType.BITMAP_WRAPPER,
	WindowElementType.STATIC_BITMAP_WRAPPER,
	WindowElementType.DISPLAY_OBJECT_WRAPPER,
	WindowElementType.SHAPE_WRAPPER,
	WindowElementType.ICON,
], WindowBitmapWrapper);
