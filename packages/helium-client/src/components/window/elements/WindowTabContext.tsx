import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Tab context / tab button element.
 *
 * Handles TAB_CONTEXT, TAB_CONTENT, TAB_SELECTOR, TAB_BUTTON types.
 */
export function WindowTabContext(props: WindowElementProps): JSX.Element
{
	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		return base;
	};

	return (
		<div
			class={`hw-tab hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
		>
			<WindowChildren children={props.node.children} windowId={props.windowId} />
		</div>
	);
}

registerWindowComponents([
	WindowElementType.TAB_CONTENT,
	WindowElementType.TAB_CONTEXT,
	WindowElementType.TAB_SELECTOR,
	WindowElementType.TAB_BUTTON,
	WindowElementType.TAB_CONTAINER_BUTTON,
], WindowTabContext);
