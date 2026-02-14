import {createSignal} from 'solid-js';
import type {JSX} from 'solid-js';
import {WindowElementType} from '@habbo/window/enum/WindowElementType';
import {registerWindowComponents} from '../WindowComponentRegistry';
import type {WindowElementProps} from '../WindowComponentRegistry';
import {nodePositionStyle} from '../WindowLayoutRenderer';

/**
 * Checkbox / radiobutton element.
 */
export function WindowCheckbox(props: WindowElementProps): JSX.Element
{
	const [checked, setChecked] = createSignal(false);
	const isRadio = props.node.typeId === WindowElementType.RADIOBUTTON;

	const style = (): JSX.CSSProperties =>
	{
		const base = nodePositionStyle(props.node);
		base.position = 'absolute';
		base.cursor = 'pointer';
		return base;
	};

	return (
		<div
			class={`hw-checkbox hw-style-${props.node.attributes.style ?? '0'} ${checked() ? 'hw-state-selected' : 'hw-state-default'}`}
			data-name={props.node.attributes.name}
			data-radio={isRadio}
			style={style()}
			onClick={() => setChecked(!checked())}
		>
			{props.node.attributes.caption ?? ''}
		</div>
	);
}

registerWindowComponents([
	WindowElementType.CHECKBOX,
	WindowElementType.RADIOBUTTON,
	WindowElementType.SELECTOR,
	WindowElementType.SELECTOR_LIST,
], WindowCheckbox);
