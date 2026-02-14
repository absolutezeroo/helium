import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Widget placeholder element.
 *
 * Renders a container that can be replaced by a specialized widget
 * (avatar_image, badge_image, room_previewer, etc.) via the WidgetRegistry.
 */
export function WindowWidget(props: WindowElementProps): JSX.Element
{
	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		return base;
	};

	return (
		<div
			class={`hw-widget hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			data-widget={props.node.attributes.widget ?? ''}
			style={style()}
		>
			<WindowChildren children={props.node.children} windowId={props.windowId} />
		</div>
	);
}

registerWindowComponents([
	WindowElementType.WIDGET,
	WindowElementType.BOXSIZER,
], WindowWidget);
