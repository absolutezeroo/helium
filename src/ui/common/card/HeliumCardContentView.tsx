import type {JSX, ParentProps} from 'solid-js';
import clsx from 'clsx';

export interface HeliumCardContentViewProps extends ParentProps
{
	class?: string;
	overflow?: boolean;
}

/**
 * HeliumCardContentView - Scrollable content area for card windows.
 */
export function HeliumCardContentView(props: HeliumCardContentViewProps): JSX.Element
{
	const shouldOverflow = () => props.overflow ?? true;

	return (
		<div
			class={clsx(
				'flex-1',
				shouldOverflow() && 'overflow-y-auto',
				props.class
			)}
		>
			{props.children}
		</div>
	);
}
