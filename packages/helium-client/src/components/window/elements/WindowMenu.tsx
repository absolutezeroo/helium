import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Menu / dropdown element.
 */
export function WindowMenu(props: WindowElementProps): JSX.Element
{
	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		return base;
	};

	return (
		<div
			class={`hw-menu hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
		>
			<WindowChildren children={props.node.children} windowId={props.windowId} />
		</div>
	);
}

registerWindowComponents([
	WindowElementType.MENU,
	WindowElementType.MENU_ITEM,
	WindowElementType.DROPMENU,
	WindowElementType.DROPMENU_ITEM,
	WindowElementType.SUBMENU,
	WindowElementType.DROPLIST,
	WindowElementType.DROPLIST_ITEM,
], WindowMenu);
