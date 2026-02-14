import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Text input / password field element.
 */
export function WindowInput(props: WindowElementProps): JSX.Element
{
	const isPassword = props.node.typeId === WindowElementType.PASSWORD;

	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		return base;
	};

	return (
		<input
			class={`hw-input hw-style-${props.node.attributes.style ?? '0'}`}
			data-name={props.node.attributes.name}
			type={isPassword ? 'password' : 'text'}
			placeholder={props.node.attributes.caption ?? ''}
			style={style()}
		/>
	);
}

registerWindowComponents([
	WindowElementType.TEXTFIELD,
	WindowElementType.PASSWORD,
], WindowInput);
