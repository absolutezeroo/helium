import type {JSX} from 'solid-js';
import {GetWidgetLayout} from './GetWidgetLayout';

export interface WidgetSlotViewProps
{
	widgetType: string;
	widgetSlot: number;
	widgetConf: any;
	class?: string;
}

/**
 * WidgetSlotView - Container for a single widget slot.
 * @see source_nitro_react/components/hotel-view/views/widgets/WidgetSlotView.tsx
 */
export function WidgetSlotView(props: WidgetSlotViewProps): JSX.Element
{
	return (
		<div class={`widget-slot slot-${props.widgetSlot} ${props.class || ''}`}>
			<GetWidgetLayout widgetType={props.widgetType} slot={props.widgetSlot} widgetConf={props.widgetConf} />
		</div>
	);
}
