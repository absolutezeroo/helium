import type {IWindowRenderer} from './IWindowRenderer';
import type {ISkinContainer} from './ISkinContainer';
import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IWindowContainer} from '../IWindowContainer';
import {WindowType} from '../enum/WindowType';
import {WindowRendererItem} from './WindowRendererItem';

/**
 * Window renderer managing per-window draw buffers and compositing.
 *
 * In AS3, WindowRenderer managed BitmapData draw buffers, dirty region
 * merging, and composited the full tree into a single BitmapData displayed
 * as a Bitmap on the Stage. In TypeScript, each window gets its own
 * OffscreenCanvas buffer; composite() merges them all into a single buffer.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/WindowRenderer.as
 */
export class WindowRenderer implements IWindowRenderer
{
	private _skinContainer: ISkinContainer;
	private _renderQueue: IWindow[] = [];
	private _dirtyRegions: ({ x: number; y: number; width: number; height: number }[])[] = [];
	/** Per-window renderer items (AS3: Dictionary keyed by IWindow). */
	private _rendererItems: Map<IWindow, WindowRendererItem> = new Map();
	/** Composite buffer for full-scene rendering. */
	private _compositeBuffer: OffscreenCanvas | null = null;
	private _compositeCtx: OffscreenCanvasRenderingContext2D | null = null;

	constructor(skinContainer: ISkinContainer)
	{
		this._skinContainer = skinContainer;
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _debug: boolean = false;

	public get debug(): boolean
	{
		return this._debug;
	}

	public set debug(value: boolean)
	{
		this._debug = value;
	}

	/**
	 * Renders all queued dirty windows.
	 *
	 * Port of AS3 WindowRenderer.render(). Processes the render queue,
	 * rendering each window and its children via renderWindowBranch().
	 */
	public render(): void
	{
		while (this._renderQueue.length > 0)
		{
			const window = this._renderQueue.pop()!;
			const dirtyRects = this._dirtyRegions.pop()!;

			if (window.disposed) continue;

			for (const dirtyRect of dirtyRects)
			{
				this.renderWindowBranch(window, dirtyRect);
			}
		}
	}

	/**
	 * Adds a window to the render queue with a dirty region.
	 *
	 * @param window - The window to render
	 * @param rect - The dirty rectangle, or null for full window
	 * @param flags - Invalidation flags
	 */
	public addToRenderQueue(window: IWindow, rect: {
		x: number;
		y: number;
		width: number;
		height: number
	} | null, flags: number): void
	{
		const dirtyRect = rect
			? {...rect}
			: {x: 0, y: 0, width: window.renderingWidth, height: window.renderingHeight};

		// Invalidate the renderer item
		const item = this.getWindowRendererItem(window);

		if (!item.invalidate(window, flags)) return;

		const index = this._renderQueue.indexOf(window);

		if (index > -1)
		{
			this._dirtyRegions[index].push(dirtyRect);
		}
		else
		{
			this._renderQueue.push(window);
			this._dirtyRegions.push([dirtyRect]);
		}
	}

	/**
	 * Clears the render queue without rendering.
	 */
	public flushRenderQueue(): void
	{
		this._renderQueue.length = 0;
		this._dirtyRegions.length = 0;
	}

	/**
	 * Invalidates all windows in the given context.
	 *
	 * @param context - The window context to invalidate
	 * @param _rect - The invalidation rectangle
	 */
	public invalidate(context: IWindowContext, _rect: { x: number; y: number; width: number; height: number }): void
	{
		const desktop = context.getDesktopWindow();

		if (!desktop) return;

		this.addToRenderQueue(desktop, null, 1);
	}

	/**
	 * Returns the draw buffer for the given window.
	 *
	 * Port of AS3 WindowRenderer.getDrawBufferForRenderable().
	 * Creates and renders a buffer if one doesn't exist yet.
	 *
	 * @param window - The window to get the buffer for
	 * @returns The OffscreenCanvas buffer, or null
	 */
	public getDrawBufferForRenderable(window: IWindow): OffscreenCanvas | null
	{
		let item = this._rendererItems.get(window);

		if (!item)
		{
			item = new WindowRendererItem(this._skinContainer);
			item.invalidate(window, 1);
			item.render(window);
			this._rendererItems.set(window, item);
		}

		return item.buffer;
	}

	/**
	 * Purges cached render data.
	 *
	 * @param window - The window to purge, or null for all
	 * @param recursive - Whether to recurse into children
	 */
	public purge(window?: IWindow | null, recursive?: boolean): void
	{
		if (window)
		{
			const item = this._rendererItems.get(window);

			if (item)
			{
				if (!window.visible || !recursive)
				{
					item.dispose();
					this._rendererItems.delete(window);
				}
				else
				{
					item.purge();
				}
			}

			// Recurse into children
			if (recursive)
			{
				const container = window as unknown as IWindowContainer;

				if (typeof container.numChildren === 'number')
				{
					for (let i = 0; i < container.numChildren; i++)
					{
						const child = container.getChildAt(i);

						if (child)
						{
							this.purge(child, recursive);
						}
					}
				}
			}
		}
		else
		{
			// Purge all
			for (const [win, item] of this._rendererItems)
			{
				if (!win.visible || !recursive)
				{
					item.dispose();
					this._rendererItems.delete(win);
				}
			}
		}
	}

	/**
	 * Removes renderer data for a disposed window.
	 *
	 * @param window - The window to remove
	 */
	public removeRenderable(window: IWindow): void
	{
		const item = this._rendererItems.get(window);

		if (item)
		{
			item.dispose();
			this._rendererItems.delete(window);
		}
	}

	/**
	 * Composites all window layers into a single OffscreenCanvas buffer.
	 *
	 * Walks each context layer (0→3), retrieves its desktop window,
	 * and recursively draws each window's skin buffer at its absolute position.
	 * This mirrors AS3's WindowRenderer.renderWindowBranch() compositing
	 * into a single BitmapData displayed as a Bitmap on the Stage.
	 *
	 * @param contexts - The array of window contexts (one per layer)
	 * @param width - The target buffer width
	 * @param height - The target buffer height
	 * @returns The composited OffscreenCanvas buffer
	 *
	 * @see sources/win63_2021_version/com/sulake/core/window/graphics/WindowRenderer.as renderWindowBranch()
	 */
	public composite(contexts: IWindowContext[], width: number, height: number): OffscreenCanvas
	{
		// Create or resize the composite buffer
		if (!this._compositeBuffer || this._compositeBuffer.width !== width || this._compositeBuffer.height !== height)
		{
			this._compositeBuffer = new OffscreenCanvas(width, height);
			this._compositeCtx = this._compositeBuffer.getContext('2d');
		}

		const ctx = this._compositeCtx!;

		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, width, height);

		// Walk layers 0→3 (background → tooltips)
		for (let i = 0; i < contexts.length; i++)
		{
			const desktop = contexts[i].getDesktopWindow();

			if (!desktop || !desktop.visible) continue;

			// Render desktop's children (not the desktop itself — it's a root container)
			const container = desktop as unknown as IWindowContainer;

			if (typeof container.numChildren !== 'number') continue;

			for (let j = 0; j < container.numChildren; j++)
			{
				const child = container.getChildAt(j);

				if (child)
				{
					this.compositeWindow(ctx, child, 0, 0);
				}
			}
		}


		return this._compositeBuffer;
	}

	/**
	 * Finds the deepest visible window at the given point.
	 *
	 * Iterates layers in REVERSE order (tooltips → background) so that
	 * the topmost layer wins. Within each layer, children are tested in
	 * reverse order (last child = visually on top).
	 *
	 * @param contexts - The array of window contexts (one per layer)
	 * @param x - The global X coordinate
	 * @param y - The global Y coordinate
	 * @returns The deepest window at the point, or null
	 *
	 * @see sources/win63_2021_version/com/sulake/core/window/components/ContainerController.as getChildUnderPoint()
	 */
	public findWindowAtPoint(contexts: IWindowContext[], x: number, y: number): IWindow | null
	{
		// Iterate layers in REVERSE (tooltips → background)
		for (let i = contexts.length - 1; i >= 0; i--)
		{
			const desktop = contexts[i].getDesktopWindow();

			if (!desktop || !desktop.visible) continue;

			const container = desktop as unknown as IWindowContainer;

			if (typeof container.numChildren !== 'number') continue;

			// Test children in reverse (topmost first)
			for (let j = container.numChildren - 1; j >= 0; j--)
			{
				const child = container.getChildAt(j);

				if (!child) continue;

				const hit = this.hitTestRecursive(child, x, y, 0, 0);

				if (hit) return hit;
			}
		}

		return null;
	}

	public dispose(): void
	{
		if (!this._disposed)
		{
			this._disposed = true;

			for (const item of this._rendererItems.values())
			{
				item.dispose();
			}

			this._rendererItems.clear();
			this._renderQueue.length = 0;
			this._dirtyRegions.length = 0;
			this._compositeBuffer = null;
			this._compositeCtx = null;
		}
	}

	/**
	 * Recursively renders a window and its children.
	 *
	 * Port of AS3 WindowRenderer.renderWindowBranch(). In AS3 this composited
	 * into a parent BitmapData; in TS each window renders into its own buffer.
	 *
	 * @param window - The window to render
	 * @param dirtyRegion - The dirty region to render
	 */
	private renderWindowBranch(
		window: IWindow,
		dirtyRegion: { x: number; y: number; width: number; height: number }
	): void
	{
		if (!window.visible) return;

		// Render this window's skin into its own buffer
		const item = this.getWindowRendererItem(window);

		item.render(window);

		// Recurse into children if this is a container
		const container = window as unknown as IWindowContainer;

		if (typeof container.numChildren !== 'number') return;

		for (let i = 0; i < container.numChildren; i++)
		{
			const child = container.getChildAt(i);

			if (!child || !child.visible) continue;

			// Check if child intersects dirty region
			const childRect = {
				x: child.x,
				y: child.y,
				width: child.width,
				height: child.height
			};

			if (this.rectsIntersect(childRect, dirtyRegion))
			{
				// Offset dirty region to child's local space
				const childDirty = {
					x: dirtyRegion.x - child.x,
					y: dirtyRegion.y - child.y,
					width: dirtyRegion.width,
					height: dirtyRegion.height
				};

				this.renderWindowBranch(child, childDirty);
			}
		}
	}

	/**
	 * Returns the WindowRendererItem for a window, creating one if needed.
	 *
	 * Port of AS3 WindowRenderer.getWindowRendererItem().
	 *
	 * @param window - The window
	 * @returns The renderer item
	 */
	private getWindowRendererItem(window: IWindow): WindowRendererItem
	{
		let item = this._rendererItems.get(window);

		if (!item)
		{
			item = new WindowRendererItem(this._skinContainer);
			this._rendererItems.set(window, item);
		}

		return item;
	}

	/**
	 * Tests if two rectangles intersect.
	 *
	 * @param a - First rectangle
	 * @param b - Second rectangle
	 * @returns True if they intersect
	 */
	private rectsIntersect(
		a: { x: number; y: number; width: number; height: number },
		b: { x: number; y: number; width: number; height: number }
	): boolean
	{
		return a.x < b.x + b.width
			&& a.x + a.width > b.x
			&& a.y < b.y + b.height
			&& a.y + a.height > b.y;
	}

	/**
	 * Recursively composites a window and its children onto the target context.
	 *
	 * @param ctx - The 2D rendering context to draw into
	 * @param window - The window to composite
	 * @param offsetX - The parent's absolute X offset
	 * @param offsetY - The parent's absolute Y offset
	 */
	private compositeWindow(
		ctx: OffscreenCanvasRenderingContext2D,
		window: IWindow,
		offsetX: number,
		offsetY: number
	): void
	{
		if (!window.visible) return;

		const absX = offsetX + window.x + window.offsetX;
		const absY = offsetY + window.y + window.offsetY;
		const w = window.width;
		const h = window.height;

		if (w <= 0 || h <= 0) return;

		ctx.save();

		// Clip to window bounds
		if (window.clipping)
		{
			ctx.beginPath();
			ctx.rect(absX, absY, w, h);
			ctx.clip();
		}

		// Apply blend (opacity)
		const blend = window.blend;

		if (blend < 1)
		{
			ctx.globalAlpha = blend;
		}

		// Draw background fill if the window has one
		if (window.background)
		{
			const color = window.color;
			const a = ((color >>> 24) & 0xFF) / 255;
			const r = (color >> 16) & 0xFF;
			const g = (color >> 8) & 0xFF;
			const b = color & 0xFF;

			ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
			ctx.fillRect(absX, absY, w, h);
		}

		// Draw the skin buffer (skip for bitmap wrappers — their content is drawn via bitmapData below)
		const isBitmapWrapper = window.type === WindowType.BITMAP_WRAPPER || window.type === WindowType.STATIC_BITMAP_WRAPPER;

		if (!isBitmapWrapper)
		{
			const buffer = this.getDrawBufferForRenderable(window);

			if (buffer && buffer.width > 0 && buffer.height > 0)
			{
				ctx.drawImage(buffer, absX, absY);
			}
		}

		// Draw bitmapData content (from BitmapDataController hierarchy)
		if (isBitmapWrapper)
		{
			const bmp = (window as unknown as { bitmapData?: ImageBitmap | null }).bitmapData;

			if (bmp)
			{
				ctx.drawImage(bmp, absX, absY, w, h);
			}
		}

		// Draw text content for text-type windows
		this.compositeText(ctx, window, absX, absY, w, h);

		// Recurse into children
		const container = window as unknown as IWindowContainer;

		if (typeof container.numChildren === 'number')
		{
			for (let i = 0; i < container.numChildren; i++)
			{
				const child = container.getChildAt(i);

				if (child)
				{
					this.compositeWindow(ctx, child, absX, absY);
				}
			}
		}

		ctx.restore();
	}

	/**
	 * Renders text content for text-type windows.
	 *
	 * In AS3, text was rendered by native Flash TextFields which were then
	 * composited as BitmapData via refreshTextImage(). In TypeScript, we
	 * render text directly onto the composite canvas using fillText().
	 *
	 * @param ctx - The 2D rendering context
	 * @param window - The window to render text for
	 * @param absX - Absolute X position
	 * @param absY - Absolute Y position
	 * @param w - Window width
	 * @param h - Window height
	 *
	 * @see sources/win63_2021_version/com/sulake/core/window/components/TextController.as refreshTextImage()
	 */
	private compositeText(
		ctx: OffscreenCanvasRenderingContext2D,
		window: IWindow,
		absX: number,
		absY: number,
		w: number,
		h: number
	): void
	{
		const type = window.type;

		if (type !== WindowType.TEXT && type !== WindowType.LABEL
			&& type !== WindowType.LINK && type !== WindowType.FORMATTED_TEXT
			&& type !== WindowType.TEXTFIELD && type !== WindowType.PASSWORD
			&& type !== WindowType.HTML)
		{
			return;
		}

		const text = window.caption;

		if (!text) return;

		// Duck-type text properties from TextController
		const tw = window as unknown as {
			textColor?: number;
			fontSize?: number;
			fontFace?: string;
			bold?: boolean;
			italic?: boolean;
			underline?: boolean;
			multiline?: boolean;
			wordWrap?: boolean;
			etchingColor?: number;
			etchingPosition?: string;
			_marginLeft?: number;
			_marginTop?: number;
			_marginRight?: number;
			_marginBottom?: number;
		};

		const fontSize = tw.fontSize ?? 12;
		const fontFace = tw.fontFace || 'Ubuntu, Arial, sans-serif';
		const isBold = tw.bold ?? false;
		const isItalic = tw.italic ?? false;

		// Text color from TextController.textColor (defaults to 0x000000 = black)
		const textColor = tw.textColor ?? 0x000000;
		const r = (textColor >> 16) & 0xFF;
		const g = (textColor >> 8) & 0xFF;
		const b = textColor & 0xFF;

		// Build CSS font string
		let fontStr = '';

		if (isItalic) fontStr += 'italic ';
		if (isBold) fontStr += 'bold ';
		fontStr += `${fontSize}px ${fontFace}`;

		ctx.font = fontStr;
		ctx.fillStyle = `rgb(${r},${g},${b})`;
		ctx.textBaseline = 'top';

		// Margins from TextController
		const marginL = tw._marginLeft ?? 2;
		const marginT = tw._marginTop ?? 2;
		const marginR = tw._marginRight ?? 2;
		const marginB = tw._marginBottom ?? 2;
		const maxWidth = w - marginL - marginR;

		if (maxWidth <= 0) return;

		// Determine display text
		let displayText = text;

		if (type === WindowType.PASSWORD)
		{
			displayText = '\u2022'.repeat(text.length);
		}

		// Etching (shadow text) support for il_* styles
		const etchColor = tw.etchingColor ?? 0;
		const hasEtching = etchColor !== 0 && ((etchColor >>> 24) & 0xFF) > 0;

		// Underline support for link windows
		if (type === WindowType.LINK || tw.underline)
		{
			ctx.save();

			const metrics = ctx.measureText(displayText);
			const textW = Math.min(metrics.width, maxWidth);
			const textY = absY + Math.max(0, Math.floor((h - fontSize) / 2));

			if (hasEtching)
			{
				this.drawEtching(ctx, displayText, absX + marginL, textY, maxWidth, etchColor, tw.etchingPosition);
			}

			ctx.fillText(displayText, absX + marginL, textY, maxWidth);

			// Draw underline
			const underlineY = textY + fontSize + 1;

			ctx.strokeStyle = `rgb(${r},${g},${b})`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(absX + marginL, underlineY);
			ctx.lineTo(absX + marginL + textW, underlineY);
			ctx.stroke();
			ctx.restore();

			return;
		}

		// Multiline / word-wrap rendering
		if ((tw.multiline || tw.wordWrap) && (type === WindowType.TEXT || type === WindowType.FORMATTED_TEXT || type === WindowType.HTML))
		{
			this.compositeTextMultiline(ctx, displayText, absX + marginL, absY + marginT, maxWidth, h - marginT - marginB, fontSize, tw.wordWrap ?? false, hasEtching ? etchColor : 0, tw.etchingPosition);

			return;
		}

		// Single-line rendering: vertically centered
		const textY = absY + Math.max(0, Math.floor((h - fontSize) / 2));

		if (hasEtching)
		{
			this.drawEtching(ctx, displayText, absX + marginL, textY, maxWidth, etchColor, tw.etchingPosition);
		}

		ctx.fillText(displayText, absX + marginL, textY, maxWidth);
	}

	/**
	 * Renders multiline text with optional word wrapping.
	 *
	 * @param ctx - The 2D rendering context
	 * @param text - The text to render
	 * @param x - Start X position
	 * @param y - Start Y position
	 * @param maxWidth - Maximum line width
	 * @param maxHeight - Maximum total height
	 * @param fontSize - Font size for line height calculation
	 * @param wordWrap - Whether to wrap at word boundaries
	 */
	private compositeTextMultiline(
		ctx: OffscreenCanvasRenderingContext2D,
		text: string,
		x: number,
		y: number,
		maxWidth: number,
		maxHeight: number,
		fontSize: number,
		wordWrap: boolean,
		etchingColor: number = 0,
		etchingPosition?: string
	): void
	{
		const lineHeight = fontSize + 2;
		const lines = text.split('\n');
		let currentY = y;
		const hasEtching = etchingColor !== 0 && ((etchingColor >>> 24) & 0xFF) > 0;

		for (const line of lines)
		{
			if (currentY + lineHeight > y + maxHeight) break;

			if (wordWrap && ctx.measureText(line).width > maxWidth)
			{
				// Word-wrap: break line at word boundaries
				const words = line.split(' ');
				let currentLine = '';

				for (const word of words)
				{
					const testLine = currentLine ? currentLine + ' ' + word : word;

					if (ctx.measureText(testLine).width > maxWidth && currentLine)
					{
						if (hasEtching) this.drawEtching(ctx, currentLine, x, currentY, maxWidth, etchingColor, etchingPosition);
						ctx.fillText(currentLine, x, currentY, maxWidth);
						currentY += lineHeight;

						if (currentY + lineHeight > y + maxHeight) break;

						currentLine = word;
					}
					else
					{
						currentLine = testLine;
					}
				}

				if (currentLine && currentY + lineHeight <= y + maxHeight)
				{
					if (hasEtching) this.drawEtching(ctx, currentLine, x, currentY, maxWidth, etchingColor, etchingPosition);
					ctx.fillText(currentLine, x, currentY, maxWidth);
					currentY += lineHeight;
				}
			}
			else
			{
				if (hasEtching) this.drawEtching(ctx, line, x, currentY, maxWidth, etchingColor, etchingPosition);
				ctx.fillText(line, x, currentY, maxWidth);
				currentY += lineHeight;
			}
		}
	}

	/**
	 * Draws an etching (shadow) effect behind text.
	 *
	 * The etching is a 1px offset text in the given color, typically used
	 * by `il_*` styles to give a subtle raised/sunken appearance.
	 *
	 * @param ctx - The 2D rendering context
	 * @param text - The text to etch
	 * @param x - Text X position
	 * @param y - Text Y position
	 * @param maxWidth - Maximum text width
	 * @param color - ARGB etching color
	 * @param position - Etching direction (default: "bottom")
	 */
	private drawEtching(
		ctx: OffscreenCanvasRenderingContext2D,
		text: string,
		x: number,
		y: number,
		maxWidth: number,
		color: number,
		position?: string
	): void
	{
		const a = ((color >>> 24) & 0xFF) / 255;
		const er = (color >> 16) & 0xFF;
		const eg = (color >> 8) & 0xFF;
		const eb = color & 0xFF;

		let dx = 0;
		let dy = 1;

		switch (position)
		{
			case 'top':
				dx = 0;
				dy = -1;
				break;
			case 'top-left':
				dx = -1;
				dy = -1;
				break;
			case 'top-right':
				dx = 1;
				dy = -1;
				break;
			case 'left':
				dx = -1;
				dy = 0;
				break;
			case 'right':
				dx = 1;
				dy = 0;
				break;
			case 'bottom-left':
				dx = -1;
				dy = 1;
				break;
			case 'bottom-right':
				dx = 1;
				dy = 1;
				break;
			case 'bottom':
			default:
				dx = 0;
				dy = 1;
				break;
		}

		const prevFill = ctx.fillStyle;

		ctx.fillStyle = `rgba(${er},${eg},${eb},${a})`;
		ctx.fillText(text, x + dx, y + dy, maxWidth);
		ctx.fillStyle = prevFill;
	}

	/**
	 * Recursively hit-tests a window tree.
	 *
	 * Returns the deepest window that has INPUT_EVENT_PROCESSOR (param flag 1).
	 * Child windows without this flag (e.g. static bitmaps with param 208) are
	 * tested for bounds but not returned as targets — their parent region is
	 * returned instead. This mirrors AS3's event routing where mouse events
	 * target the INPUT_EVENT_PROCESSOR container, not its passive children.
	 *
	 * @param window - The window to test
	 * @param globalX - The global X coordinate
	 * @param globalY - The global Y coordinate
	 * @param offsetX - The parent's absolute X offset
	 * @param offsetY - The parent's absolute Y offset
	 * @returns The deepest INPUT_EVENT_PROCESSOR window at the point, or null
	 */
	private hitTestRecursive(
		window: IWindow,
		globalX: number,
		globalY: number,
		offsetX: number,
		offsetY: number
	): IWindow | null
	{
		if (!window.visible) return null;

		// FLAG 9 = INTERNAL_EVENT_HANDLING → ignore mouse events
		if (window.testParamFlag(9))
		{
			return null;
		}

		const absX = offsetX + window.x;
		const absY = offsetY + window.y;
		const w = window.width;
		const h = window.height;

		// AABB bounds test
		if (globalX < absX || globalX >= absX + w || globalY < absY || globalY >= absY + h)
		{
			return null;
		}

		// Test children in reverse (topmost first)
		const container = window as unknown as IWindowContainer;

		if (typeof container.numChildren === 'number')
		{
			for (let i = container.numChildren - 1; i >= 0; i--)
			{
				const child = container.getChildAt(i);

				if (!child) continue;

				const hit = this.hitTestRecursive(child, globalX, globalY, absX, absY);

				if (hit) return hit;
			}
		}

		// Only return this window as a hit target if it is an INPUT_EVENT_PROCESSOR
		if (window.testParamFlag(1))
		{
			return window;
		}

		return null;
	}
}
