import {createEffect, createSignal, onCleanup} from 'solid-js';

export interface DraggablePosition
{
	x: number;
	y: number;
}

export interface UseDraggableOptions
{
	/** Initial position */
	initialPosition?: DraggablePosition;
	/** Constrain to viewport bounds */
	constrainToViewport?: boolean;
	/** Padding from viewport edges when constraining */
	viewportPadding?: number;
}

export interface UseDraggableReturn
{
	position: () => DraggablePosition;
	setPosition: (pos: DraggablePosition) => void;
	isDragging: () => boolean;
	bindDragTarget: (el: HTMLElement) => void;
	bindDragHandle: (el: HTMLElement) => void;
	resetPosition: () => void;
}

/**
 * Hook for making elements draggable.
 * Globally reusable - not tied to any specific component.
 */
export function useDraggable(options: UseDraggableOptions = {}): UseDraggableReturn
{
	const {
		initialPosition = {x: 0, y: 0},
		constrainToViewport = true,
		viewportPadding = 20,
	} = options;

	const [position, setPosition] = createSignal<DraggablePosition>(initialPosition);
	const [isDragging, setIsDragging] = createSignal(false);

	let targetElement: HTMLElement | null = null;
	let handleElement: HTMLElement | null = null;
	let dragStart: DraggablePosition | null = null;
	let positionStart: DraggablePosition | null = null;

	const constrainPosition = (pos: DraggablePosition): DraggablePosition =>
	{
		if (!constrainToViewport || !targetElement) return pos;

		const rect = targetElement.getBoundingClientRect();
		const maxX = window.innerWidth - rect.width - viewportPadding;
		const maxY = window.innerHeight - rect.height - viewportPadding;

		return {
			x: Math.max(viewportPadding, Math.min(pos.x, maxX)),
			y: Math.max(viewportPadding, Math.min(pos.y, maxY)),
		};
	};

	const handleMouseDown = (e: MouseEvent) =>
	{
		if (e.button !== 0) return;

		const target = e.target as HTMLElement;
		if (target.closest('button, input, select, textarea, a, [data-no-drag]'))
		{
			return;
		}

		e.preventDefault();
		setIsDragging(true);
		dragStart = {x: e.clientX, y: e.clientY};
		positionStart = position();

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	const handleMouseMove = (e: MouseEvent) =>
	{
		if (!isDragging() || !dragStart || !positionStart) return;

		const deltaX = e.clientX - dragStart.x;
		const deltaY = e.clientY - dragStart.y;

		const newPosition = constrainPosition({
			x: positionStart.x + deltaX,
			y: positionStart.y + deltaY,
		});

		setPosition(newPosition);
	};

	const handleMouseUp = () =>
	{
		setIsDragging(false);
		dragStart = null;
		positionStart = null;

		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	};

	const bindDragTarget = (el: HTMLElement) =>
	{
		targetElement = el;

		// Apply initial position
		const pos = position();
		el.style.position = 'fixed';
		el.style.left = `${pos.x}px`;
		el.style.top = `${pos.y}px`;

		// If no handle specified, make entire element draggable
		if (!handleElement)
		{
			el.addEventListener('mousedown', handleMouseDown);
		}
	};

	const bindDragHandle = (el: HTMLElement) =>
	{
		handleElement = el;
		el.style.cursor = 'move';
		el.addEventListener('mousedown', handleMouseDown);

		// Remove listener from target if it was added
		if (targetElement)
		{
			targetElement.removeEventListener('mousedown', handleMouseDown);
		}
	};

	const resetPosition = () =>
	{
		setPosition(initialPosition);
	};

	// Reactively update element position when signal changes
	createEffect(() =>
	{
		const pos = position();

		if (targetElement)
		{
			targetElement.style.left = `${pos.x}px`;
			targetElement.style.top = `${pos.y}px`;
		}
	});

	// Cleanup event listeners on unmount
	onCleanup(() =>
	{
		if (handleElement)
		{
			handleElement.removeEventListener('mousedown', handleMouseDown);
		}
		if (targetElement)
		{
			targetElement.removeEventListener('mousedown', handleMouseDown);
		}
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	});

	return {
		position,
		setPosition,
		isDragging,
		bindDragTarget,
		bindDragHandle,
		resetPosition,
	};
}
