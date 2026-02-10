import type {JSX, ParentProps} from 'solid-js';

export interface HeliumCardContentViewProps extends ParentProps
{
	class?: string;
	overflow?: string;
	position?: string;
}

/**
 * HeliumCardContentView - Scrollable content area for card windows.
 *
 * @see habbo_window_layout_frame_3_xml.bin (content_area at x=3, y=36)
 */
export function HeliumCardContentView(props: HeliumCardContentViewProps): JSX.Element
{
	return (
		<div
			class={`content-area${props.class ? ' ' + props.class : ''}`}
			style={{
				overflow: props.overflow ?? 'auto',
				position: props.position === 'relative' ? 'relative' : undefined,
			}}
		>
			{props.children}
		</div>
	);
}
