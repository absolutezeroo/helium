import type {JSX, ParentProps} from 'solid-js';
import clsx from 'clsx';

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
		<div class={clsx('border-bottom', props.class)}>
			{props.children}
		</div>
	);
}
