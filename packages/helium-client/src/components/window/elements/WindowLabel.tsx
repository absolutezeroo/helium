import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponent} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Non-interactive label element.
 */
export function WindowLabel(props: WindowElementProps): JSX.Element
{
	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		return base;
	};

	return (
		<span
			class={`hw-label hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
		>
			{props.node.attributes.caption ?? ''}
		</span>
	);
}

registerWindowComponent(WindowElementType.LABEL, WindowLabel);
registerWindowComponent(WindowElementType.LINK, WindowLabel);
