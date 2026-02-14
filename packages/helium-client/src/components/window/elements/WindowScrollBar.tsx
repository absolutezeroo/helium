import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Scrollbar element.
 *
 * Handles both horizontal and vertical scrollbar types.
 */
export function WindowScrollBar(props: WindowElementProps): JSX.Element
{
	const horizontalTypes: number[] = [
		WindowElementType.SCROLLBAR_HORIZONTAL,
		WindowElementType.SCROLLBAR_SLIDER_BAR_HORIZONTAL,
		WindowElementType.SCROLLBAR_SLIDER_TRACK_HORIZONTAL,
		WindowElementType.SCROLLBAR_SLIDER_BUTTON_LEFT,
		WindowElementType.SCROLLBAR_SLIDER_BUTTON_RIGHT,
	];
	const isHorizontal = horizontalTypes.includes(props.node.typeId);

	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		return base;
	};

	return (
		<div
			class={`hw-scrollbar ${isHorizontal ? 'hw-scrollbar-h' : 'hw-scrollbar-v'} hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
		>
			<WindowChildren children={props.node.children} windowId={props.windowId} />
		</div>
	);
}

registerWindowComponents([
	WindowElementType.SCROLLBAR_HORIZONTAL,
	WindowElementType.SCROLLBAR_VERTICAL,
	WindowElementType.SCROLLBAR_SLIDER_BAR_HORIZONTAL,
	WindowElementType.SCROLLBAR_SLIDER_BAR_VERTICAL,
	WindowElementType.SCROLLBAR_SLIDER_TRACK_HORIZONTAL,
	WindowElementType.SCROLLBAR_SLIDER_TRACK_VERTICAL,
	WindowElementType.SCROLLBAR_SLIDER_BUTTON_RIGHT,
	WindowElementType.SCROLLBAR_SLIDER_BUTTON_DOWN,
	WindowElementType.SCROLLBAR_SLIDER_BUTTON_LEFT,
	WindowElementType.SCROLLBAR_SLIDER_BUTTON_UP,
], WindowScrollBar);
