import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponent} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {nodePositionStyle} from '../WindowLayoutRenderer';
import {getWindowManager} from '../../../stores/windowStore';

/**
 * Close button element.
 *
 * Clicking this button closes the parent window.
 */
export function WindowCloseButton(props: WindowElementProps): JSX.Element
{
	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		base.cursor = 'pointer';
		return base;
	};

	function handleClick(): void
	{
		const manager = getWindowManager();

		if(manager)
		{
			manager.closeWindow(props.windowId);
		}
	}

	return (
		<div
			class={`hw-closebutton hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
			onClick={handleClick}
		/>
	);
}

registerWindowComponent(WindowElementType.CLOSEBUTTON, WindowCloseButton);
