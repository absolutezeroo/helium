import type {JSX, ParentProps} from 'solid-js';
import clsx from 'clsx';

export interface HeliumCardContentViewProps extends ParentProps
{
	class?: string;
	overflow?: string;
	position?: string;
}

/**
 * HeliumCardContentView - Scrollable content area for card windows.
 *
 * @see source_nitro_react/common/card/NitroCardContentView.tsx
 */
export function HeliumCardContentView(props: HeliumCardContentViewProps): JSX.Element
{
	const overflow = () => props.overflow ?? 'auto';
	const position = () => props.position ?? '';

	return (
		<div
			class={clsx(
				'container-fluid content-area d-flex flex-column',
				position() && `position-${position()}`,
				props.class
			)}
			style={{
				overflow: overflow(),
			}}
		>
			{props.children}
		</div>
	);
}
