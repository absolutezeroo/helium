import type {JSX, ParentProps} from 'solid-js';
import {Show} from 'solid-js';

import closeIcon from '@/assets/images/icons_close.png';

export interface WindowHeaderProps extends ParentProps
{
	title: string;
	onClose?: () => void;
	class?: string;
}

/**
 * WindowHeader - Standard window header using .habbo-window BEM classes.
 *
 * Acts as the drag handle for WindowFrame.
 * Close button uses the classic red gradient CSS (habbo_skin_button_close_3).
 *
 * @see sources/win63_version/core/window/components/HeaderController.as
 * @see HabboHabboWindowManagerCom_habbo_window_layout_header_3_xml.bin
 */
export function WindowHeader(props: WindowHeaderProps): JSX.Element
{
	const onMouseDown = (e: MouseEvent) =>
	{
		e.stopPropagation();
	};

	return (
		<div class={`habbo-window__header${props.class ? ' ' + props.class : ''}`}>
			<span class="habbo-window__title">{props.title}</span>
			{props.children}
			<Show when={props.onClose}>
				<div
					class="habbo-window__close"
					onMouseDown={onMouseDown}
					onClick={() => props.onClose?.()}
				>
					<img src={closeIcon} alt="" />
				</div>
			</Show>
		</div>
	);
}
