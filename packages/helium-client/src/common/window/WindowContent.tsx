import type {JSX, ParentProps} from 'solid-js';

export interface WindowContentProps extends ParentProps
{
	class?: string;
	overflow?: string;
}

/**
 * WindowContent - Scrollable content area using .habbo-window BEM classes.
 *
 * @see habbo_window_layout_frame_3_xml.bin (content_area at x=3, y=36)
 */
export function WindowContent(props: WindowContentProps): JSX.Element
{
	return (
		<div
			class={`habbo-window__content${props.class ? ' ' + props.class : ''}`}
			style={{
				overflow: props.overflow ?? undefined,
			}}
		>
			{props.children}
		</div>
	);
}
