import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Text display element.
 *
 * Handles TEXT and FORMATTED_TEXT types.
 */
export function WindowText(props: WindowElementProps): JSX.Element
{
	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		return base;
	};

	return (
		<div
			class={`hw-text hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			style={style()}
		>
			{props.node.attributes.caption ?? ''}
		</div>
	);
}

registerWindowComponents([
	WindowElementType.TEXT,
	WindowElementType.FORMATTED_TEXT,
	WindowElementType.HTML,
], WindowText);
