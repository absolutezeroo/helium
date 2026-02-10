import type {JSX, ParentProps} from 'solid-js';

export interface TabItem
{
	id: string;
	label: string;
	count?: number;
	icon?: JSX.Element;
}

export interface HeliumCardTabsViewProps extends ParentProps
{
	class?: string;
}

/**
 * HeliumCardTabsView - Tabs container for card windows.
 *
 * @see habbo_skin_button_tab_3_xml.bin (32px tall, 3 states)
 */
export function HeliumCardTabsView(props: HeliumCardTabsViewProps): JSX.Element
{
	return (
		<div class={`helium-card-tabs${props.class ? ' ' + props.class : ''}`}>
			{props.children}
		</div>
	);
}
