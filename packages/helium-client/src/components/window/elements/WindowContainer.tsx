import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';
import {isClipping} from '../utils/paramUtils';

/**
 * Generic container element.
 *
 * Handles CONTAINER, REGION, HEADER, TOOLBAR types.
 * Positions children absolutely and optionally clips overflow.
 */
export function WindowContainer(props: WindowElementProps): JSX.Element
{
	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		const params = props.node.params ?? 0;

		base.position = 'absolute';

		if(isClipping(params))
		{
			base.overflow = 'hidden';
		}

		return base;
	};

	return (
		<div
			class={`hw-container hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
		>
			<WindowChildren children={props.node.children} windowId={props.windowId} />
		</div>
	);
}

registerWindowComponents([
	WindowElementType.CONTAINER,
	WindowElementType.REGION,
	WindowElementType.HEADER,
	WindowElementType.TOOLBAR,
	WindowElementType.BACKGROUND,
	WindowElementType.NOTIFY,
], WindowContainer);
