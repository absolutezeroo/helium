import type {JSX, ParentProps} from 'solid-js';
import {Show} from 'solid-js';

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
 * Header uses header_strip.png bitmap tinted via background-blend-mode: multiply.
 * Close button uses bitmap states (close_button_default/hover/pressed.png).
 *
 * @see sources/win63_version/core/window/components/HeaderController.as
 * @see HabboHabboWindowManagerCom_habbo_skin_frame_3_xml.bin
 * @see HabboHabboWindowManagerCom_habbo_skin_button_close_3_xml.bin
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
				/>
			</Show>
		</div>
	);
}
