import type {JSX} from 'solid-js';
import {createEffect, For, onMount, Show} from 'solid-js';
import type {IWindow} from '@core/window/IWindow';
import {WindowController} from '@core/window/WindowController';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {useWindow} from '../../hooks/useWindow';
import {Helium} from 'helium-engine';
import type {WindowMouseOperator} from '@core/window/services/WindowMouseOperator';

/**
 * Converts an engine color value (0xAARRGGBB) to a CSS rgba() string.
 *
 * @param color - The 32-bit ARGB color value
 * @returns CSS rgba string
 */
function colorToRgba(color: number): string
{
	const a = ((color >>> 24) & 0xFF) / 255;
	const r = (color >> 16) & 0xFF;
	const g = (color >> 8) & 0xFF;
	const b = color & 0xFF;

	return `rgba(${r},${g},${b},${a})`;
}

/**
 * Renders the skin buffer from the engine into a canvas element.
 *
 * @param canvas - The canvas element to draw into
 * @param win - The engine window
 * @param w - The desired width
 * @param h - The desired height
 */
function renderSkinToCanvas(canvas: HTMLCanvasElement, win: IWindow, w: number, h: number): void
{
	const renderer = Helium.instance.windowManager.getWindowRenderer();

	if(!renderer) return;

	const buffer = renderer.getDrawBufferForRenderable(win) as OffscreenCanvas | null;

	if(!buffer) return;

	if(canvas.width !== w || canvas.height !== h)
	{
		canvas.width = w;
		canvas.height = h;
	}

	const ctx = canvas.getContext('2d');

	if(!ctx) return;

	ctx.imageSmoothingEnabled = false;
	ctx.clearRect(0, 0, w, h);
	ctx.drawImage(buffer, 0, 0);
}

/**
 * Renders a single IWindow node.
 *
 * Forwards DOM mouse events to the engine's WindowController.update()
 * method, enabling procedures, drag, scale, and other interactions.
 *
 * Displays the engine's rendered skin buffer (OffscreenCanvas) via
 * a canvas element positioned absolutely behind the children.
 */
function WindowNode(props: { window: IWindow }): JSX.Element
{
	const win = props.window;
	const {x, y, width, height, visible, caption, children, background, color, blend, state} = useWindow(win);

	let skinCanvasRef: HTMLCanvasElement | undefined;

	const onMouseDown = (e: MouseEvent) =>
	{
		e.stopPropagation();

		const event = WindowMouseEvent.allocateMouse(
			WindowMouseEvent.DOWN, win, null,
			e.offsetX, e.offsetY, e.clientX, e.clientY,
			e.altKey, e.ctrlKey, e.shiftKey, true
		);
		(win as WindowController).update(win as WindowController, event);
		event.recycle();

		// Register document-level listeners for drag/scale
		const serviceManager = Helium.instance.windowManager.getServiceManager();

		if(serviceManager)
		{
			const dragger = serviceManager.getMouseDraggingService() as WindowMouseOperator;
			const scaler = serviceManager.getMouseScalingService() as WindowMouseOperator;

			const onDocMove = (ev: MouseEvent) =>
			{
				dragger.handleMouseMove(ev.clientX, ev.clientY);
				scaler.handleMouseMove(ev.clientX, ev.clientY);
			};

			const onDocUp = (ev: MouseEvent) =>
			{
				dragger.handleMouseUp();
				scaler.handleMouseUp();

				// Dispatch UP event to window
				const upEvent = WindowMouseEvent.allocateMouse(
					WindowMouseEvent.UP, win, null,
					0, 0, ev.clientX, ev.clientY
				);
				(win as WindowController).update(win as WindowController, upEvent);
				upEvent.recycle();

				document.removeEventListener('mousemove', onDocMove);
				document.removeEventListener('mouseup', onDocUp);
			};

			document.addEventListener('mousemove', onDocMove);
			document.addEventListener('mouseup', onDocUp);
		}
	};

	const onMouseOver = (e: MouseEvent) =>
	{
		e.stopPropagation();

		const event = WindowMouseEvent.allocateMouse(WindowMouseEvent.OVER, win, null, e.offsetX, e.offsetY, e.clientX, e.clientY);
		(win as WindowController).update(win as WindowController, event);
		event.recycle();
	};

	const onMouseOut = (e: MouseEvent) =>
	{
		e.stopPropagation();

		const event = WindowMouseEvent.allocateMouse(WindowMouseEvent.OUT, win, null, e.offsetX, e.offsetY, e.clientX, e.clientY);
		(win as WindowController).update(win as WindowController, event);
		event.recycle();
	};

	/**
	 * Computes visual inline styles from engine properties.
	 *
	 * `background` = whether the window has a filled background.
	 * `color` = 0xAARRGGBB fill color.
	 * `blend` = opacity (0-1).
	 */
	const visualStyle = (): JSX.CSSProperties =>
	{
		const style: JSX.CSSProperties = {
			position: 'absolute',
			left: `${x()}px`,
			top: `${y()}px`,
			width: `${width()}px`,
			height: `${height()}px`,
		};

		if(background())
		{
			style['background-color'] = colorToRgba(color());
		}

		const b = blend();

		if(b < 1)
		{
			style.opacity = `${b}`;
		}

		return style;
	};

	// Render skin when component mounts or state/size changes
	onMount(() =>
	{
		if(skinCanvasRef)
		{
			renderSkinToCanvas(skinCanvasRef, win, width(), height());
		}
	});

	// Re-render skin when window state or size changes
	createEffect(() =>
	{
		// Track reactive dependencies
		const w = width();
		const h = height();
		const _s = state();

		if(skinCanvasRef && w > 0 && h > 0)
		{
			renderSkinToCanvas(skinCanvasRef, win, w, h);
		}
	});

	return (
		<Show when={visible()}>
			<div
				class={`hw-iwindow hw-type-${win.type}`}
				style={visualStyle()}
				data-name={win.name}
				data-type={win.type}
				onMouseDown={onMouseDown}
				onMouseOver={onMouseOver}
				onMouseOut={onMouseOut}
			>
				<canvas
					ref={skinCanvasRef}
					style={{
						position: 'absolute',
						left: '0',
						top: '0',
						width: '100%',
						height: '100%',
						'pointer-events': 'none',
					}}
				/>
				<Show when={caption()}>
					<span class="hw-caption">{caption()}</span>
				</Show>
				<For each={children()}>
					{(child) => <WindowNode window={child}/>}
				</For>
			</div>
		</Show>
	);
}

/**
 * Recursive SolidJS component that renders an IWindow and its children to DOM.
 *
 * When called without a window prop (e.g., at the App root), renders nothing.
 * When given a window, renders it and all its children recursively.
 * Reactive signals from useWindow ensure the DOM stays in sync with
 * engine-side property changes.
 */
export function WindowRenderer(props: { window?: IWindow }): JSX.Element
{
	if(!props.window) return null as unknown as JSX.Element;

	return <WindowNode window={props.window}/>;
}
