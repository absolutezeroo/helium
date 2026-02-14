import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {WindowChildren, nodePositionStyle} from '../WindowLayoutRenderer';
import {useDraggable} from '../hooks/useDraggable';
import {isDraggable} from '../utils/paramUtils';

/**
 * Frame element — draggable window with titlebar, close button, and content area.
 *
 * Handles FRAME, FRAME_THIN, FRAME_THICK, FRAME_NOTIFY types.
 */
export function WindowFrame(props: WindowElementProps): JSX.Element
{
	let frameRef: HTMLDivElement | undefined;
	let headerRef: HTMLDivElement | undefined;

	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		return base;
	};

	const draggable = isDraggable(props.node.params ?? 0);

	if(draggable)
	{
		useDraggable(() => headerRef, () => frameRef);
	}

	return (
		<div
			ref={frameRef}
			class={`hw-frame hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
		>
			<div ref={headerRef} class="hw-frame-header">
				{props.node.attributes.caption ?? ''}
			</div>
			<div class="hw-frame-content">
				<WindowChildren children={props.node.children} windowId={props.windowId} />
			</div>
		</div>
	);
}

registerWindowComponents([
	WindowElementType.FRAME,
	WindowElementType.FRAME_THIN,
	WindowElementType.FRAME_THICK,
	WindowElementType.FRAME_NOTIFY,
], WindowFrame);
