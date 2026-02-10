import type {JSX, ParentProps} from 'solid-js';
import {createSignal, onCleanup, onMount} from 'solid-js';
import {Portal} from 'solid-js/web';
import {useDraggable} from '@ui/hooks';
import {WindowManager} from './WindowManager';

export interface HeliumCardViewProps extends ParentProps
{
	uniqueKey: string;
	width?: number;
	height?: number;
	class?: string;
	theme?: string;
}

/**
 * HeliumCardView - Standard draggable window component.
 *
 * Renders via Portal into #draggable-windows-container.
 * Uses WindowManager for z-index stacking.
 * Children with class `drag-handler` are used as drag handles.
 *
 * @see source_as_win63/core/window/components/FrameController.as
 * @see habbo_window_layout_frame_3_xml.bin
 */
export function HeliumCardView(props: HeliumCardViewProps): JSX.Element
{
	const w = () => props.width ?? 480;
	const h = () => props.height ?? 500;

	const [zIndex, setZIndex] = createSignal(0);

	const draggable = useDraggable({
		initialPosition: {
			x: Math.max(20, (window.innerWidth - w()) / 2),
			y: Math.max(20, (window.innerHeight - h()) / 2),
		},
		constrainToViewport: true,
		viewportPadding: 20,
	});

	const refreshZIndex = () =>
	{
		setZIndex(WindowManager.getZIndex(props.uniqueKey));
	};

	onMount(() =>
	{
		WindowManager.register(props.uniqueKey);
		WindowManager.bringToFront(props.uniqueKey);
		refreshZIndex();
	});

	onCleanup(() =>
	{
		WindowManager.unregister(props.uniqueKey);
	});

	const handleMouseDown = () =>
	{
		WindowManager.bringToFront(props.uniqueKey);
		refreshZIndex();
	};

	const portalTarget = () =>
		document.getElementById('draggable-windows-container') ?? document.body;

	return (
		<Portal mount={portalTarget()}>
			<div
				ref={(el) =>
				{
					draggable.bindDragTarget(el);

					requestAnimationFrame(() =>
					{
						const handle = el.querySelector('.drag-handler');

						if (handle)
						{
							draggable.bindDragHandle(handle as HTMLElement);
						}
					});
				}}
				class={`helium-card${draggable.isDragging() ? ' no-select' : ''}${props.class ? ' ' + props.class : ''}`}
				style={{
					position: 'fixed',
					width: `${w()}px`,
					height: `${h()}px`,
					'z-index': zIndex(),
				}}
				onMouseDown={handleMouseDown}
			>
				{props.children}
			</div>
		</Portal>
	);
}
