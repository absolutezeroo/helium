import type {JSX} from 'solid-js';
import {For, Show} from 'solid-js';
import type {IWindow} from '@core/window/IWindow';
import {WindowController} from '@core/window/WindowController';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {useWindow} from '../../hooks/useWindow';
import {Helium} from 'helium-engine';
import type {WindowMouseOperator} from '@core/window/services/WindowMouseOperator';

/**
 * Renders a single IWindow node.
 *
 * Forwards DOM mouse events to the engine's WindowController.update()
 * method, enabling procedures, drag, scale, and other interactions.
 */
function WindowNode(props: { window: IWindow }): JSX.Element
{
	const win = props.window;
	const {x, y, width, height, visible, caption, children} = useWindow(win);

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

	return (
		<Show when={visible()}>
			<div
				class={`hw-iwindow hw-type-${win.type}`}
				style={{
					position: 'absolute',
					left: `${x()}px`,
					top: `${y()}px`,
					width: `${width()}px`,
					height: `${height()}px`,
				}}
				data-name={win.name}
				data-type={win.type}
				onMouseDown={onMouseDown}
				onMouseOver={onMouseOver}
				onMouseOut={onMouseOut}
			>
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
