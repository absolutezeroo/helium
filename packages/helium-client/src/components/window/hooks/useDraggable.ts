import {onCleanup, onMount} from 'solid-js';

/**
 * Make an element draggable by mouse.
 *
 * Supports dragging a window frame by its header/dragbar.
 * The drag target is the element that moves; the drag trigger is the
 * element that captures mouse events (e.g. the title bar).
 *
 * @param triggerRef - Accessor for the trigger element (mousedown target)
 * @param targetRef - Accessor for the target element (the element that moves)
 */
export function useDraggable(
	triggerRef: () => HTMLElement | undefined,
	targetRef: () => HTMLElement | undefined
): void
{
	let startX = 0;
	let startY = 0;
	let offsetX = 0;
	let offsetY = 0;
	let dragging = false;

	function onMouseDown(e: MouseEvent): void
	{
		const target = targetRef();

		if(!target) return;

		e.preventDefault();
		e.stopPropagation();

		dragging = true;
		startX = e.clientX;
		startY = e.clientY;

		const rect = target.getBoundingClientRect();
		offsetX = rect.left;
		offsetY = rect.top;

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	function onMouseMove(e: MouseEvent): void
	{
		if(!dragging) return;

		const target = targetRef();

		if(!target) return;

		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		target.style.left = `${offsetX + dx}px`;
		target.style.top = `${offsetY + dy}px`;
	}

	function onMouseUp(): void
	{
		dragging = false;
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
	}

	onMount(() =>
	{
		const trigger = triggerRef();

		if(trigger)
		{
			trigger.addEventListener('mousedown', onMouseDown);
		}
	});

	onCleanup(() =>
	{
		const trigger = triggerRef();

		if(trigger)
		{
			trigger.removeEventListener('mousedown', onMouseDown);
		}

		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
	});
}
