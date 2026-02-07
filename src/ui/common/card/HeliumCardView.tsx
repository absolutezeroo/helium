import type {JSX, ParentProps} from 'solid-js';
import {createSignal, onCleanup, onMount} from 'solid-js';
import {Portal} from 'solid-js/web';
import clsx from 'clsx';
import {useDraggable} from '@ui/hooks';
import {WindowManager} from './WindowManager';

export interface HeliumCardViewProps extends ParentProps
{
	uniqueKey: string;
	width?: number;
	height?: number;
	class?: string;
}

/**
 * HeliumCardView - Standard draggable window component.
 *
 * Renders via Portal into #draggable-windows-container.
 * Uses WindowManager for z-index stacking.
 * Children with class `drag-handle` are used as drag handles.
 *
 * @example
 * ```tsx
 * <HeliumCardView uniqueKey="navigator" width={480} height={600}>
 *   <HeliumCardHeaderView title="Navigator" onClose={close} />
 *   <HeliumCardContentView>...</HeliumCardContentView>
 * </HeliumCardView>
 * ```
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

					// Find and bind the drag handle (HeliumCardHeaderView)
					requestAnimationFrame(() =>
					{
						const handle = el.querySelector('.drag-handle');

						if (handle)
						{
							draggable.bindDragHandle(handle as HTMLElement);
						}
					});
				}}
				class={clsx(
					'fixed flex flex-col',
					'bg-slate-900 border border-slate-700',
					'rounded-xl shadow-2xl overflow-hidden',
					draggable.isDragging() && 'select-none',
					props.class
				)}
				style={{
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
