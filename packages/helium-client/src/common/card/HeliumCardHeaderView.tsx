import type {JSX, ParentProps} from 'solid-js';
import {Show} from 'solid-js';

import closeIcon from '@/assets/images/icons_close.png';

export interface HeliumCardHeaderViewProps extends ParentProps
{
	title: string;
	icon?: JSX.Element;
	onClose?: () => void;
	class?: string;
}

/**
 * HeliumCardHeaderView - Standard window header.
 *
 * Uses `drag-handler` class for HeliumCardView to detect as drag handle.
 * Close button uses Flash close icon asset.
 *
 * @see source_as_win63/core/window/components/HeaderController.as
 * @see habbo_window_layout_header_3_xml.bin
 */
export function HeliumCardHeaderView(props: HeliumCardHeaderViewProps): JSX.Element
{
	const onMouseDown = (e: MouseEvent) =>
	{
		e.stopPropagation();
	};

	return (
		<div class={`drag-handler helium-card-header${props.class ? ' ' + props.class : ''}`}>
			<span class="helium-card-header-text">{props.title}</span>
			{props.children}
			<Show when={props.onClose}>
				<div
					class="helium-card-header-close"
					onMouseDown={onMouseDown}
					onClick={() => props.onClose?.()}
				>
					<img src={closeIcon} alt="" />
				</div>
			</Show>
		</div>
	);
}
