import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IWindowContainer} from '../IWindowContainer';
import {WindowParam} from '../enum/WindowParam';
import {WindowType} from '../enum/WindowType';

type DrawBufferResolver = (window: IWindow) => OffscreenCanvas | null;

/**
 * Canvas composition and hit-test adapter for the web runtime.
 *
 * This class is not part of AS3 WindowRenderer itself; it contains the
 * bridge logic needed by the DOM canvas shell.
 */
export class WindowComposite
{
    private _compositeBuffer: OffscreenCanvas | null = null;
    private _compositeCtx: OffscreenCanvasRenderingContext2D | null = null;
    private _drawBufferResolver: DrawBufferResolver;

    constructor(drawBufferResolver: DrawBufferResolver)
    {
        this._drawBufferResolver = drawBufferResolver;
    }

    public composite(contexts: IWindowContext[], width: number, height: number): OffscreenCanvas
    {
        if(!this._compositeBuffer || (this._compositeBuffer.width !== width) || (this._compositeBuffer.height !== height))
        {
            this._compositeBuffer = new OffscreenCanvas(width, height);
            this._compositeCtx = this._compositeBuffer.getContext('2d');
        }

        const ctx = this._compositeCtx;

        if(!ctx)
        {
            return this._compositeBuffer!;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, width, height);

        for(let i = 0; i < contexts.length; i++)
        {
            const desktop = contexts[i].getDesktopWindow();

            if(!desktop || !desktop.visible)
            {
                continue;
            }

            const container = desktop as unknown as IWindowContainer;

            if(!this.isWindowContainer(container))
            {
                continue;
            }

            for(let j = 0; j < container.numChildren; j++)
            {
                const child = container.getChildAt(j);

                if(child)
                {
                    this.compositeWindow(ctx, child, 0, 0);
                }
            }
        }

        return this._compositeBuffer;
    }

    public findWindowAtPoint(contexts: IWindowContext[], x: number, y: number): IWindow | null
    {
        for(let i = contexts.length - 1; i >= 0; i--)
        {
            const desktop = contexts[i].getDesktopWindow();

            if(!desktop || !desktop.visible)
            {
                continue;
            }

            const container = desktop as unknown as IWindowContainer;

            if(!this.isWindowContainer(container))
            {
                continue;
            }

            for(let j = container.numChildren - 1; j >= 0; j--)
            {
                const child = container.getChildAt(j);

                if(!child)
                {
                    continue;
                }

                const hit = this.hitTestRecursive(child, x, y, 0, 0);

                if(hit)
                {
                    return hit;
                }
            }
        }

        return null;
    }

    public dispose(): void
    {
        this._compositeBuffer = null;
        this._compositeCtx = null;
    }

    private getDrawBufferForRenderable(window: IWindow): OffscreenCanvas | null
    {
        return this._drawBufferResolver(window);
    }

    private isWindowContainer(target: unknown): target is IWindowContainer
    {
        return !!target
            && (typeof (target as IWindowContainer).numChildren === 'number')
            && (typeof (target as IWindowContainer).getChildAt === 'function');
    }

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

		const typedWindow = window as unknown as { text?: string };
		const text = typedWindow.text ?? window.caption;

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
			autoSize?: string;
			_autoSize?: string;
			spacing?: number;
			_spacing?: number;
			leading?: number;
			_leading?: number;
			marginLeft?: number;
			marginTop?: number;
			marginRight?: number;
			marginBottom?: number;
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
		const marginL = tw.marginLeft ?? tw._marginLeft ?? 2;
		const marginT = tw.marginTop ?? tw._marginTop ?? 2;
		const marginR = tw.marginRight ?? tw._marginRight ?? 2;
		const marginB = tw.marginBottom ?? tw._marginBottom ?? 2;
		const autoSize = (tw.autoSize ?? tw._autoSize ?? 'none').toLowerCase();
		const spacing = tw.spacing ?? tw._spacing ?? 0;
		const leading = tw.leading ?? tw._leading ?? 0;
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

			const measuredWidth = this.measureTextWidth(ctx, displayText, spacing);
			const textW = Math.min(measuredWidth, maxWidth);
			const textX = this.resolveAlignedTextX(absX + marginL, maxWidth, measuredWidth, autoSize);
			const textY = absY + marginT;

			if (hasEtching)
			{
				this.drawEtching(ctx, displayText, textX, textY, maxWidth, etchColor, tw.etchingPosition, spacing);
			}

			this.drawTextLine(ctx, displayText, textX, textY, maxWidth, spacing);

			// Draw underline
			const underlineY = textY + fontSize + 1;

			ctx.strokeStyle = `rgb(${r},${g},${b})`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(textX, underlineY);
			ctx.lineTo(textX + textW, underlineY);
			ctx.stroke();
			ctx.restore();

			return;
		}

		// Multiline / word-wrap rendering
		if ((tw.multiline || tw.wordWrap) && (type === WindowType.TEXT || type === WindowType.FORMATTED_TEXT || type === WindowType.HTML))
		{
			this.compositeTextMultiline(
				ctx,
				displayText,
				absX + marginL,
				absY + marginT,
				maxWidth,
				h - marginT - marginB,
				fontSize,
				tw.wordWrap ?? false,
				hasEtching ? etchColor : 0,
				tw.etchingPosition,
				spacing,
				leading,
				autoSize
			);

			return;
		}

		const measuredWidth = this.measureTextWidth(ctx, displayText, spacing);
		const textX = this.resolveAlignedTextX(absX + marginL, maxWidth, measuredWidth, autoSize);
		const textY = absY + marginT;

		if (hasEtching)
		{
			this.drawEtching(ctx, displayText, textX, textY, maxWidth, etchColor, tw.etchingPosition, spacing);
		}

		this.drawTextLine(ctx, displayText, textX, textY, maxWidth, spacing);
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
		etchingPosition?: string,
		spacing: number = 0,
		leading: number = 0,
		autoSize: string = 'none'
	): void
	{
		const lineHeight = Math.max(1, fontSize + 2 + leading);
		const lines = text.split('\n');
		let currentY = y;
		const hasEtching = etchingColor !== 0 && ((etchingColor >>> 24) & 0xFF) > 0;

		for (const line of lines)
		{
			if (currentY + lineHeight > y + maxHeight)
			{
				break;
			}

			if (wordWrap && this.measureTextWidth(ctx, line, spacing) > maxWidth)
			{
				for (const wrappedLine of this.wrapLine(ctx, line, maxWidth, spacing))
				{
					if (currentY + lineHeight > y + maxHeight)
					{
						break;
					}

					const measuredWidth = this.measureTextWidth(ctx, wrappedLine, spacing);
					const drawX = this.resolveAlignedTextX(x, maxWidth, measuredWidth, autoSize);

					if (hasEtching)
					{
						this.drawEtching(ctx, wrappedLine, drawX, currentY, maxWidth, etchingColor, etchingPosition, spacing);
					}

					this.drawTextLine(ctx, wrappedLine, drawX, currentY, maxWidth, spacing);
					currentY += lineHeight;
				}
			}
			else
			{
				const measuredWidth = this.measureTextWidth(ctx, line, spacing);
				const drawX = this.resolveAlignedTextX(x, maxWidth, measuredWidth, autoSize);

				if (hasEtching)
				{
					this.drawEtching(ctx, line, drawX, currentY, maxWidth, etchingColor, etchingPosition, spacing);
				}

				this.drawTextLine(ctx, line, drawX, currentY, maxWidth, spacing);
				currentY += lineHeight;
			}
		}
	}

	private resolveAlignedTextX(
		baseX: number,
		maxWidth: number,
		textWidth: number,
		autoSize: string
	): number
	{
		if (autoSize === 'center')
		{
			return baseX + Math.max(0, Math.floor((maxWidth - textWidth) / 2));
		}

		if (autoSize === 'right')
		{
			return baseX + Math.max(0, Math.floor(maxWidth - textWidth));
		}

		return baseX;
	}

	private measureTextWidth(
		ctx: OffscreenCanvasRenderingContext2D,
		text: string,
		spacing: number
	): number
	{
		if (!text)
		{
			return 0;
		}

		const width = ctx.measureText(text).width;

		if (spacing === 0 || text.length <= 1)
		{
			return width;
		}

		return width + ((text.length - 1) * spacing);
	}

	private drawTextLine(
		ctx: OffscreenCanvasRenderingContext2D,
		text: string,
		x: number,
		y: number,
		maxWidth: number,
		spacing: number
	): void
	{
		if (!text)
		{
			return;
		}

		if (spacing === 0)
		{
			ctx.fillText(text, x, y, maxWidth);

			return;
		}

		let drawX = x;
		const maxX = x + maxWidth;

		for (let i = 0; i < text.length; i++)
		{
			const char = text.charAt(i);
			const charWidth = ctx.measureText(char).width;

			if (drawX + charWidth > maxX)
			{
				break;
			}

			ctx.fillText(char, drawX, y);
			drawX += charWidth + spacing;
		}
	}

	private wrapLine(
		ctx: OffscreenCanvasRenderingContext2D,
		line: string,
		maxWidth: number,
		spacing: number
	): string[]
	{
		if (!line)
		{
			return [''];
		}

		const words = line.split(' ');
		const out: string[] = [];
		let current = '';

		for (const word of words)
		{
			const candidate = current ? `${current} ${word}` : word;

			if (this.measureTextWidth(ctx, candidate, spacing) <= maxWidth || !current)
			{
				current = candidate;
			}
			else
			{
				out.push(current);
				current = word;
			}

			if (this.measureTextWidth(ctx, current, spacing) > maxWidth)
			{
				const broken = this.wrapLongWord(ctx, current, maxWidth, spacing);

				if (broken.length > 0)
				{
					out.push(...broken.slice(0, broken.length - 1));
					current = broken[broken.length - 1];
				}
			}
		}

		if (current)
		{
			out.push(current);
		}

		return out;
	}

	private wrapLongWord(
		ctx: OffscreenCanvasRenderingContext2D,
		word: string,
		maxWidth: number,
		spacing: number
	): string[]
	{
		const out: string[] = [];
		let current = '';

		for (let i = 0; i < word.length; i++)
		{
			const next = current + word.charAt(i);

			if (this.measureTextWidth(ctx, next, spacing) <= maxWidth || !current)
			{
				current = next;
			}
			else
			{
				out.push(current);
				current = word.charAt(i);
			}
		}

		if (current)
		{
			out.push(current);
		}

		return out;
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
		position?: string,
		spacing: number = 0
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
		this.drawTextLine(ctx, text, x + dx, y + dy, maxWidth, spacing);
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
