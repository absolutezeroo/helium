import type {JSX, ParentProps} from 'solid-js';

export interface HeliumCardSubHeaderViewProps extends ParentProps
{
	class?: string;
}

/**
 * HeliumCardSubHeaderView - Sub-header area for tabs, search bars, etc.
 */
export function HeliumCardSubHeaderView(props: HeliumCardSubHeaderViewProps): JSX.Element
{
	return (
		<div class={`helium-card-subheader${props.class ? ' ' + props.class : ''}`}>
			{props.children}
		</div>
	);
}
