import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Item list element — vertical or horizontal list of children via flexbox.
 *
 * Handles ITEMLIST, ITEMGRID, SCROLLABLE_ITEMLIST types.
 */
export function WindowItemList(props: WindowElementProps): JSX.Element
{
	const horizontalTypes: number[] = [
		WindowElementType.ITEMLIST_HORIZONTAL,
		WindowElementType.ITEMGRID_HORIZONTAL,
		WindowElementType.SCROLLABLE_ITEMLIST_HORIZONTAL,
	];
	const isHorizontal = horizontalTypes.includes(props.node.typeId);

	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		base.display = 'flex';
		base['flex-direction'] = isHorizontal ? 'row' : 'column';
		base.overflow = 'auto';
		return base;
	};

	return (
		<div
			class={`hw-itemlist hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
		>
			<WindowChildren children={props.node.children} windowId={props.windowId} />
		</div>
	);
}

registerWindowComponents([
	WindowElementType.ITEMLIST,
	WindowElementType.ITEMLIST_HORIZONTAL,
	WindowElementType.ITEMGRID,
	WindowElementType.ITEMGRID_VERTICAL,
	WindowElementType.ITEMGRID_HORIZONTAL,
	WindowElementType.SCROLLABLE_ITEMLIST,
	WindowElementType.SCROLLABLE_ITEMLIST_VERTICAL,
	WindowElementType.SCROLLABLE_ITEMLIST_HORIZONTAL,
	WindowElementType.SCROLLABLE_ITEMGRID_VERTICAL,
], WindowItemList);
