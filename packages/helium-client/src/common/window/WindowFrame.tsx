import type {JSX, ParentProps} from 'solid-js';
import {createSignal, onCleanup, onMount} from 'solid-js';
import {Portal} from 'solid-js/web';
import {useDraggable} from '@ui/hooks';
import {WindowManager} from '../card/WindowManager';

export interface WindowFrameProps extends ParentProps
{
	uniqueKey: string;
	title: string;
	width?: number;
	height?: number;
	headerColor?: string;
	variant?: 'default' | 'alert' | 'notify';
	class?: string;
	onClose?: () => void;
}

/**
 * WindowFrame - Standard draggable window using .habbo-window BEM classes.
 *
 * Renders via Portal into #draggable-windows-container.
 * Uses WindowManager for z-index stacking.
 * The header element is used as the drag handle.
 *
 * @see sources/win63_version/core/window/components/FrameController.as
 * @see habbo_window_layout_frame_3_xml.bin
 */
export function WindowFrame(props: WindowFrameProps): JSX.Element
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

	const variantClass = () =>
	{
		if(props.variant === 'alert') return ' habbo-window--alert';
		if(props.variant === 'notify') return ' habbo-window--notify';
		return '';
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
						const handle = el.querySelector('.habbo-window__header');

						if(handle)
						{
							draggable.bindDragHandle(handle as HTMLElement);
						}
					});
				}}
				class={`habbo-window${variantClass()}${draggable.isDragging() ? ' no-select' : ''}${props.class ? ' ' + props.class : ''}`}
				style={{
					position: 'fixed',
					width: `${w()}px`,
					height: `${h()}px`,
					'z-index': zIndex(),
					...(props.headerColor ? {'--habbo-header-color': props.headerColor} as any : {}),
				}}
				onMouseDown={handleMouseDown}
			>
				{props.children}
			</div>
		</Portal>
	);
}
