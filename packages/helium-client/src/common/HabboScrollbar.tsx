import {createEffect, createSignal, JSX, onCleanup, onMount, Show} from 'solid-js';
import type {ParentProps} from 'solid-js';

// Arrow button images from skin_ubuntu.png atlas
import arrowUp from '@/assets/images/scrollbar_arrow_up.png';
import arrowUpHover from '@/assets/images/scrollbar_arrow_up_hover.png';
import arrowUpPressed from '@/assets/images/scrollbar_arrow_up_pressed.png';
import arrowUpDisabled from '@/assets/images/scrollbar_arrow_up_disabled.png';
import arrowDown from '@/assets/images/scrollbar_arrow_down.png';
import arrowDownHover from '@/assets/images/scrollbar_arrow_down_hover.png';
import arrowDownPressed from '@/assets/images/scrollbar_arrow_down_pressed.png';
import arrowDownDisabled from '@/assets/images/scrollbar_arrow_down_disabled.png';

export interface HabboScrollbarProps extends ParentProps
{
	class?: string;
	/** Ref callback to access the internal viewport element (for scrollTop reset, etc.) */
	viewportRef?: (el: HTMLDivElement) => void;
}

/**
 * HabboScrollbar - Custom bitmap scrollbar matching Flash ScrollBarController.
 *
 * Always visible (like Flash). When content doesn't overflow, arrows show
 * disabled state and thumb is hidden (AS3: disable() hides lift, disables buttons).
 *
 * Layout (vertical, 17px wide - Ubuntu/style 3 skin):
 *   - Up arrow button (17x16)
 *   - Track (17px wide, tiled 17x2 background)
 *     - Thumb: top cap (5px) + tiled mid (16px pattern) + bottom cap (5px), min height 12px
 *   - Down arrow button (17x16)
 *
 * @see source_as_win63/core/window/components/ScrollBarController.as
 * @see HabboHabboWindowManagerCom_habbo_skin_scrollbar_3_xml.bin
 * @see HabboHabboWindowManagerCom_habbo_window_layout_scrollbar_vertical_xml.bin
 */
export function HabboScrollbar(props: HabboScrollbarProps): JSX.Element
{
	let viewportRef: HTMLDivElement | undefined;
	let trackRef: HTMLDivElement | undefined;
	let thumbRef: HTMLDivElement | undefined;

	const [scrollEnabled, setScrollEnabled] = createSignal(false);
	const [thumbTop, setThumbTop] = createSignal(0);
	const [thumbHeight, setThumbHeight] = createSignal(24);
	const [isDragging, setIsDragging] = createSignal(false);
	const [isThumbHover, setIsThumbHover] = createSignal(false);
	const [upState, setUpState] = createSignal<'default' | 'hover' | 'pressed' | 'disabled'>('disabled');
	const [downState, setDownState] = createSignal<'default' | 'hover' | 'pressed' | 'disabled'>('disabled');

	// Scroll step: AS3 uses 0.1 (10% of scrollable range per click)
	const SCROLL_STEP = 0.1;
	const MIN_THUMB_HEIGHT = 12;
	const REPEAT_DELAY = 400;
	const REPEAT_INTERVAL = 50;

	let dragStartY = 0;
	let dragStartThumbTop = 0;
	let repeatTimer: number | undefined;
	let repeatInterval: number | undefined;

	const getTrackHeight = (): number =>
	{
		if(!trackRef) return 0;

		return trackRef.clientHeight;
	};

	const getScrollRatio = (): number =>
	{
		if(!viewportRef) return 0;

		const maxScroll = viewportRef.scrollHeight - viewportRef.clientHeight;

		return maxScroll > 0 ? viewportRef.scrollTop / maxScroll : 0;
	};

	const updateThumb = (): void =>
	{
		if(!viewportRef || !trackRef) return;

		const viewportHeight = viewportRef.clientHeight;
		const contentHeight = viewportRef.scrollHeight;

		const canScroll = contentHeight > viewportHeight + 1;

		setScrollEnabled(canScroll);

		if(!canScroll)
		{
			// AS3: disable() — arrows go disabled, thumb becomes invisible
			setUpState('disabled');
			setDownState('disabled');
			return;
		}

		const trackH = getTrackHeight();
		const ratio = viewportHeight / contentHeight;
		let tH = Math.max(MIN_THUMB_HEIGHT, Math.round(ratio * trackH));

		if(tH > trackH) tH = trackH;

		setThumbHeight(tH);

		const scrollRatio = getScrollRatio();
		const maxThumbTop = trackH - tH;

		setThumbTop(Math.round(scrollRatio * maxThumbTop));
	};

	const scrollTo = (ratio: number): void =>
	{
		if(!viewportRef) return;

		const clamped = Math.max(0, Math.min(1, ratio));
		const maxScroll = viewportRef.scrollHeight - viewportRef.clientHeight;

		viewportRef.scrollTop = clamped * maxScroll;
	};

	const scrollBy = (delta: number): void =>
	{
		if(!viewportRef) return;

		const maxScroll = viewportRef.scrollHeight - viewportRef.clientHeight;

		if(maxScroll <= 0) return;

		const current = viewportRef.scrollTop / maxScroll;

		scrollTo(current + delta);
	};

	// --- Arrow button handlers ---

	const startRepeat = (delta: number): void =>
	{
		scrollBy(delta);

		repeatTimer = window.setTimeout(() =>
		{
			repeatInterval = window.setInterval(() => scrollBy(delta), REPEAT_INTERVAL);
		}, REPEAT_DELAY);
	};

	const stopRepeat = (): void =>
	{
		if(repeatTimer !== undefined)
		{
			clearTimeout(repeatTimer);
			repeatTimer = undefined;
		}

		if(repeatInterval !== undefined)
		{
			clearInterval(repeatInterval);
			repeatInterval = undefined;
		}
	};

	const handleArrowUpDown = (e: MouseEvent): void =>
	{
		if(!scrollEnabled()) return;

		e.preventDefault();
		setUpState('pressed');
		startRepeat(-SCROLL_STEP);

		const onUp = (): void =>
		{
			setUpState('hover');
			stopRepeat();
			window.removeEventListener('mouseup', onUp);
		};

		window.addEventListener('mouseup', onUp);
	};

	const handleArrowDownDown = (e: MouseEvent): void =>
	{
		if(!scrollEnabled()) return;

		e.preventDefault();
		setDownState('pressed');
		startRepeat(SCROLL_STEP);

		const onUp = (): void =>
		{
			setDownState('hover');
			stopRepeat();
			window.removeEventListener('mouseup', onUp);
		};

		window.addEventListener('mouseup', onUp);
	};

	// --- Track click (page scroll) ---

	const handleTrackClick = (e: MouseEvent): void =>
	{
		if(!trackRef || !viewportRef || !scrollEnabled() || e.target !== trackRef) return;

		const trackRect = trackRef.getBoundingClientRect();
		const clickY = e.clientY - trackRect.top;
		const currentThumbTop = thumbTop();

		if(clickY < currentThumbTop)
		{
			// Page up
			const pageRatio = (viewportRef.clientHeight - 20) / (viewportRef.scrollHeight - viewportRef.clientHeight);

			scrollBy(-pageRatio);
		}
		else if(clickY > currentThumbTop + thumbHeight())
		{
			// Page down
			const pageRatio = (viewportRef.clientHeight - 20) / (viewportRef.scrollHeight - viewportRef.clientHeight);

			scrollBy(pageRatio);
		}
	};

	// --- Thumb drag ---

	const handleThumbDown = (e: MouseEvent): void =>
	{
		if(!scrollEnabled()) return;

		e.preventDefault();
		e.stopPropagation();

		setIsDragging(true);
		dragStartY = e.clientY;
		dragStartThumbTop = thumbTop();

		const onMove = (me: MouseEvent): void =>
		{
			const dy = me.clientY - dragStartY;
			const trackH = getTrackHeight();
			const maxTop = trackH - thumbHeight();

			if(maxTop <= 0) return;

			const newTop = Math.max(0, Math.min(maxTop, dragStartThumbTop + dy));
			const ratio = newTop / maxTop;

			scrollTo(ratio);
		};

		const onUp = (): void =>
		{
			setIsDragging(false);
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	};

	// --- Scroll sync ---

	const handleScroll = (): void =>
	{
		if(!isDragging())
		{
			updateThumb();
		}
	};

	// --- Wheel on scrollbar itself ---

	const handleScrollbarWheel = (e: WheelEvent): void =>
	{
		e.preventDefault();

		if(!viewportRef) return;

		viewportRef.scrollTop += e.deltaY;
	};

	// --- Update arrow disabled states when scrolling ---

	createEffect(() =>
	{
		// Re-run when thumb position changes
		thumbTop();

		if(!viewportRef || !scrollEnabled()) return;

		const maxScroll = viewportRef.scrollHeight - viewportRef.clientHeight;
		const atTop = viewportRef.scrollTop <= 0;
		const atBottom = viewportRef.scrollTop >= maxScroll - 1;

		if(atTop && upState() !== 'disabled') setUpState('disabled');
		else if(!atTop && upState() === 'disabled') setUpState('default');

		if(atBottom && downState() !== 'disabled') setDownState('disabled');
		else if(!atBottom && downState() === 'disabled') setDownState('default');
	});

	// --- ResizeObserver ---

	onMount(() =>
	{
		if(!viewportRef) return;

		updateThumb();

		const ro = new ResizeObserver(() => updateThumb());

		ro.observe(viewportRef);

		// Also observe the first child (content) for size changes
		if(viewportRef.firstElementChild)
		{
			ro.observe(viewportRef.firstElementChild);
		}

		onCleanup(() =>
		{
			ro.disconnect();
			stopRepeat();
		});
	});

	// Observe content mutations (children added/removed)
	onMount(() =>
	{
		if(!viewportRef) return;

		const mo = new MutationObserver(() => updateThumb());

		mo.observe(viewportRef, {childList: true, subtree: true});

		onCleanup(() => mo.disconnect());
	});

	const getArrowSrc = (dir: 'up' | 'down', state: string): string =>
	{
		if(dir === 'up')
		{
			switch(state)
			{
				case 'hover': return arrowUpHover;
				case 'pressed': return arrowUpPressed;
				case 'disabled': return arrowUpDisabled;
				default: return arrowUp;
			}
		}
		else
		{
			switch(state)
			{
				case 'hover': return arrowDownHover;
				case 'pressed': return arrowDownPressed;
				case 'disabled': return arrowDownDisabled;
				default: return arrowDown;
			}
		}
	};

	const thumbModifier = (): string =>
	{
		if(isDragging()) return ' habbo-scrollbar__thumb--pressed';
		if(isThumbHover()) return ' habbo-scrollbar__thumb--hover';

		return '';
	};

	return (
		<div class={`habbo-scrollbar-container${props.class ? ' ' + props.class : ''}`}>
			<div
				class="habbo-scrollbar-viewport"
				ref={(el) => { viewportRef = el; props.viewportRef?.(el); }}
				onScroll={handleScroll}
			>
				{props.children}
			</div>

			<div
				class={`habbo-scrollbar${scrollEnabled() ? '' : ' habbo-scrollbar--disabled'}`}
				onWheel={handleScrollbarWheel}
			>
				{/* Up arrow (decrement) */}
				<div
					class="habbo-scrollbar__arrow habbo-scrollbar__arrow--up"
					onMouseDown={handleArrowUpDown}
					onMouseEnter={() => { if(upState() !== 'disabled') setUpState('hover'); }}
					onMouseLeave={() => { if(upState() !== 'disabled') setUpState('default'); }}
				>
					<img
						src={getArrowSrc('up', upState())}
						alt=""
						draggable={false}
					/>
				</div>

				{/* Track */}
				<div
					class="habbo-scrollbar__track"
					ref={trackRef}
					onMouseDown={handleTrackClick}
				>
					{/* Thumb (3-part) — only shown when scrollable */}
					<Show when={scrollEnabled()}>
						<div
							class={`habbo-scrollbar__thumb${thumbModifier()}`}
							ref={thumbRef}
							style={{
								top: `${thumbTop()}px`,
								height: `${thumbHeight()}px`,
							}}
							onMouseDown={handleThumbDown}
							onMouseEnter={() => setIsThumbHover(true)}
							onMouseLeave={() => setIsThumbHover(false)}
						>
							<div class="habbo-scrollbar__thumb-top" />
							<div class="habbo-scrollbar__thumb-mid" />
							<div class="habbo-scrollbar__thumb-btm" />
						</div>
					</Show>
				</div>

				{/* Down arrow (increment) */}
				<div
					class="habbo-scrollbar__arrow habbo-scrollbar__arrow--down"
					onMouseDown={handleArrowDownDown}
					onMouseEnter={() => { if(downState() !== 'disabled') setDownState('hover'); }}
					onMouseLeave={() => { if(downState() !== 'disabled') setDownState('default'); }}
				>
					<img
						src={getArrowSrc('down', downState())}
						alt=""
						draggable={false}
					/>
				</div>
			</div>
		</div>
	);
}
