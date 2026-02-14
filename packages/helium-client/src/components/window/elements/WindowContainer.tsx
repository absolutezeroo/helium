import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {WindowManagerEvents} from '@habbo/window/IHabboWindowManager';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';
import {isClipping} from '../utils/paramUtils';
import {getWindowManager} from '../../../stores/windowStore';

/**
 * Generic container element.
 *
 * Handles CONTAINER, REGION, HEADER, TOOLBAR types.
 * Positions children absolutely and optionally clips overflow.
 *
 * REGION elements (typeId 5) emit a window element click event
 * when clicked, following the AS3 pattern where regions dispatch
 * WindowEvent.CLICK with the element name.
 */
export function WindowContainer(props: WindowElementProps): JSX.Element
{
	const isRegion = props.node.typeId === WindowElementType.REGION;

	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		const params = props.node.params ?? 0;

		base.position = 'absolute';

		if(isClipping(params))
		{
			base.overflow = 'hidden';
		}

		if(isRegion)
		{
			base.cursor = 'pointer';
		}

		return base;
	};

	const handleClick = (e: MouseEvent): void =>
	{
		if(!isRegion) return;

		const name = props.node.attributes.name;

		if(!name) return;

		// Prevent child regions from triggering parent region clicks
		e.stopPropagation();

		const manager = getWindowManager();

		if(manager)
		{
			manager.windowEvents.emit(WindowManagerEvents.WINDOW_ELEMENT_CLICK, {
				windowId: props.windowId,
				elementName: name,
				node: props.node,
			});
		}
	};

	return (
		<div
			class={`hw-container hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
			onClick={isRegion ? handleClick : undefined}
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
