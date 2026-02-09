import {createSignal, onCleanup} from 'solid-js';

export interface DraggableOptions
{
	initialPosition?: { x: number; y: number };
	constrainToViewport?: boolean;
	viewportPadding?: number;
}

export interface DraggableResult
{
	bindDragTarget: (el: HTMLElement) => void;
	bindDragHandle: (el: HTMLElement) => void;
	isDragging: () => boolean;
}

/**
 * SolidJS hook for making elements draggable.
 *
 * Manages mouse/touch drag on a handle element, applying position to a target element.
 * Optionally constrains the target within the viewport.
 *
 * @see source_nitro_react/src/common/draggable-window/DraggableWindow.tsx
 */
export function useDraggable(options: DraggableOptions = {}): DraggableResult
{
	const {
		initialPosition = {x: 0, y: 0},
		constrainToViewport = false,
		viewportPadding = 0,
	} = options;

	const [isDragging, setIsDragging] = createSignal(false);

	let targetEl: HTMLElement | null = null;
	let handleEl: HTMLElement | null = null;

	let posX = initialPosition.x;
	let posY = initialPosition.y;
	let startX = 0;
	let startY = 0;
	let offsetX = 0;
	let offsetY = 0;

	const applyPosition = (x: number, y: number) =>
	{
		if (constrainToViewport && targetEl)
		{
			const rect = targetEl.getBoundingClientRect();
			const maxX = window.innerWidth - rect.width - viewportPadding;
			const maxY = window.innerHeight - rect.height - viewportPadding;
			x = Math.max(viewportPadding, Math.min(x, maxX));
			y = Math.max(viewportPadding, Math.min(y, maxY));
		}

		posX = x;
		posY = y;

		if (targetEl)
		{
			targetEl.style.left = `${x}px`;
			targetEl.style.top = `${y}px`;
		}
	};

	const onPointerMove = (e: PointerEvent) =>
	{
		e.preventDefault();
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		applyPosition(offsetX + dx, offsetY + dy);
	};

	const onPointerUp = () =>
	{
		setIsDragging(false);
		document.removeEventListener('pointermove', onPointerMove);
		document.removeEventListener('pointerup', onPointerUp);
	};

	const onPointerDown = (e: PointerEvent) =>
	{
		if (e.button !== 0) return;

		e.preventDefault();
		setIsDragging(true);

		startX = e.clientX;
		startY = e.clientY;
		offsetX = posX;
		offsetY = posY;

		document.addEventListener('pointermove', onPointerMove);
		document.addEventListener('pointerup', onPointerUp);
	};

	const bindDragTarget = (el: HTMLElement) =>
	{
		targetEl = el;
		applyPosition(posX, posY);
	};

	const bindDragHandle = (el: HTMLElement) =>
	{
		if (handleEl)
		{
			handleEl.removeEventListener('pointerdown', onPointerDown);
		}

		handleEl = el;
		handleEl.addEventListener('pointerdown', onPointerDown);
	};

	onCleanup(() =>
	{
		if (handleEl)
		{
			handleEl.removeEventListener('pointerdown', onPointerDown);
		}

		document.removeEventListener('pointermove', onPointerMove);
		document.removeEventListener('pointerup', onPointerUp);
	});

	return {bindDragTarget, bindDragHandle, isDragging};
}
