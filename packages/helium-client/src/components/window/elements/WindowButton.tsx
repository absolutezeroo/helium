import {createSignal} from 'solid-js';
import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Button element with hover/pressed/disabled states.
 *
 * Handles all BUTTON type variants.
 */
export function WindowButton(props: WindowElementProps): JSX.Element
{
	const [hovered, setHovered] = createSignal(false);
	const [pressed, setPressed] = createSignal(false);

	const stateClass = (): string =>
	{
		if(props.node.attributes.visible === 'false') return 'hw-state-disabled';
		if(pressed()) return 'hw-state-pressed';
		if(hovered()) return 'hw-state-hover';
		return 'hw-state-default';
	};

	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		base.cursor = 'pointer';
		return base;
	};

	return (
		<div
			class={`hw-button hw-style-${props.node.attributes.style ?? '0'} ${stateClass()}`}
			data-name={props.node.attributes.name}
			style={style()}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => { setHovered(false); setPressed(false); }}
			onMouseDown={() => setPressed(true)}
			onMouseUp={() => setPressed(false)}
		>
			{props.node.attributes.caption ?? ''}
			<WindowChildren children={props.node.children} windowId={props.windowId} />
		</div>
	);
}

registerWindowComponents([
	WindowElementType.BUTTON,
	WindowElementType.BUTTON_THICK,
	WindowElementType.BUTTON_ICON,
	WindowElementType.BUTTON_UP,
	WindowElementType.BUTTON_DOWN,
	WindowElementType.BUTTON_LEFT,
	WindowElementType.BUTTON_RIGHT,
	WindowElementType.BUTTON_GROUP_LEFT,
	WindowElementType.BUTTON_GROUP_CENTER,
	WindowElementType.BUTTON_GROUP_RIGHT,
	WindowElementType.CONTAINER_BUTTON,
	WindowElementType.ACTIVATOR,
], WindowButton);
