/**
 * Canvas 9-slice skin renderer.
 *
 * Port of AS3 BitmapSkinRenderer.draw(). Takes a skin definition (template + layout),
 * a target size, and a spritesheet atlas, then draws the 9-slice pieces on an
 * offscreen canvas.
 *
 * Scale modes:
 * - 0 (FIXED): piece stays at its layout position
 * - 1 (MOVE): piece shifts by +deltaW or +deltaH (anchored to right/bottom)
 * - 2 (STRETCH): piece stretches by +deltaW or +deltaH
 * - 4 (TILED): piece repeats to fill the area
 * - 8 (CENTER): piece is centered in the available space
 *
 * @see sources/flash_version/com/sulake/core/window/graphics/BitmapSkinRenderer.as
 */

import type { ISkinData, ISkinLayout, ISkinLayoutEntity, ISkinTemplate, ISkinTemplateEntity } from './skinLoader';

// ── Scale mode constants ─────────────────────────────────────────────

const SCALE_FIXED = 0;
const SCALE_MOVE = 1;
const SCALE_STRETCH = 2;
const SCALE_TILED = 4;
const SCALE_CENTER = 8;

// ── Public API ───────────────────────────────────────────────────────

/**
 * Render a skin state to an offscreen canvas.
 *
 * @param skin - The skin data
 * @param stateName - The state to render (e.g. 'default', 'hovering', 'pressed')
 * @param atlas - The spritesheet CanvasImageSource
 * @param targetWidth - The desired output width
 * @param targetHeight - The desired output height
 * @param color - The colorize color (0xAARRGGBB or 0xRRGGBB)
 * @returns The rendered canvas, or null if the state/layout/template is not found
 */
export function renderSkin(
	skin: ISkinData,
	stateName: string,
	atlas: CanvasImageSource,
	targetWidth: number,
	targetHeight: number,
	color: number
): HTMLCanvasElement | null
{
	if(targetWidth < 1 || targetHeight < 1) return null;

	// Find state
	const state = skin.states.find(s => s.name === stateName);

	if(!state) return null;

	// Find template and layout
	const template = skin.templates.find(t => t.name === state.template);
	const layout = skin.layouts.find(l => l.name === state.layout);

	if(!template || !layout) return null;

	// Create offscreen canvas
	const canvas = document.createElement('canvas');

	canvas.width = targetWidth;
	canvas.height = targetHeight;

	const ctx = canvas.getContext('2d');

	if(!ctx) return null;

	// Disable image smoothing for pixel-perfect rendering
	ctx.imageSmoothingEnabled = false;

	// Compute layout dimensions from the layout entities
	const layoutWidth = computeLayoutDimension(layout, 'width');
	const layoutHeight = computeLayoutDimension(layout, 'height');

	// Delta = how much we need to expand beyond the base layout size
	const deltaW = targetWidth - layoutWidth;
	const deltaH = targetHeight - layoutHeight;

	// Build a name->entity map for the template
	const templateMap = new Map<string, ISkinTemplateEntity>();

	for(const entity of template.entities)
	{
		templateMap.set(entity.name, entity);
	}

	// Extract the RGB color for colorization
	const colorR = (color >> 16) & 0xFF;
	const colorG = (color >> 8) & 0xFF;
	const colorB = color & 0xFF;
	const isWhite = (colorR === 255 && colorG === 255 && colorB === 255);
	const colorHex = `#${colorR.toString(16).padStart(2, '0')}${colorG.toString(16).padStart(2, '0')}${colorB.toString(16).padStart(2, '0')}`;

	// Draw each layout entity
	for(const layoutEntity of layout.entities)
	{
		const templateEntity = templateMap.get(layoutEntity.name);

		if(!templateEntity) continue;

		// Source region in the spritesheet
		const srcX = templateEntity.region.x;
		const srcY = templateEntity.region.y;
		const srcW = templateEntity.region.width;
		const srcH = templateEntity.region.height;

		if(srcW < 1 || srcH < 1) continue;

		// Destination region (from layout)
		let destX = layoutEntity.region.x;
		let destY = layoutEntity.region.y;
		let destW = layoutEntity.region.width;
		let destH = layoutEntity.region.height;

		// Apply horizontal scale mode
		switch(layoutEntity.scaleH)
		{
			case SCALE_FIXED:
				// No change
				break;
			case SCALE_MOVE:
				destX += deltaW;
				break;
			case SCALE_STRETCH:
				destW += deltaW;
				break;
			case SCALE_TILED:
				destW += deltaW;
				break;
			case SCALE_CENTER:
				destX += Math.floor(deltaW / 2);
				break;
		}

		// Apply vertical scale mode
		switch(layoutEntity.scaleV)
		{
			case SCALE_FIXED:
				// No change
				break;
			case SCALE_MOVE:
				destY += deltaH;
				break;
			case SCALE_STRETCH:
				destH += deltaH;
				break;
			case SCALE_TILED:
				destH += deltaH;
				break;
			case SCALE_CENTER:
				destY += Math.floor(deltaH / 2);
				break;
		}

		// Skip if the computed size is invalid
		if(destW < 1 || destH < 1) continue;

		// Draw the piece
		if(layoutEntity.scaleH === SCALE_TILED || layoutEntity.scaleV === SCALE_TILED)
		{
			drawTiled(ctx, atlas, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
		}
		else
		{
			ctx.drawImage(atlas, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
		}

		// Apply colorization if needed
		if(layoutEntity.colorize && !isWhite && color !== 0)
		{
			colorize(ctx, colorHex, destX, destY, destW, destH, atlas, srcX, srcY, srcW, srcH, layoutEntity.scaleH === SCALE_TILED || layoutEntity.scaleV === SCALE_TILED);
		}
	}

	return canvas;
}

/**
 * Render a skin state and return it as a data URL.
 *
 * @param skin - The skin data
 * @param stateName - The state name
 * @param atlas - The spritesheet CanvasImageSource
 * @param targetWidth - The desired output width
 * @param targetHeight - The desired output height
 * @param color - The colorize color
 * @returns A data URL string, or null on failure
 */
export function renderSkinToDataUrl(
	skin: ISkinData,
	stateName: string,
	atlas: CanvasImageSource,
	targetWidth: number,
	targetHeight: number,
	color: number
): string | null
{
	const canvas = renderSkin(skin, stateName, atlas, targetWidth, targetHeight, color);

	if(!canvas) return null;

	return canvas.toDataURL('image/png');
}

// ── Private helpers ──────────────────────────────────────────────────

/**
 * Compute the total layout dimension by finding the max extent of all entities.
 */
function computeLayoutDimension(layout: ISkinLayout, axis: 'width' | 'height'): number
{
	let max = 0;

	const posKey = axis === 'width' ? 'x' : 'y';

	for(const entity of layout.entities)
	{
		// Only count FIXED entities for the base dimension
		const scale = axis === 'width' ? entity.scaleH : entity.scaleV;

		if(scale === SCALE_FIXED || scale === SCALE_MOVE)
		{
			const extent = entity.region[posKey] + entity.region[axis];

			if(extent > max) max = extent;
		}
	}

	return max;
}

/**
 * Draw a source region tiled across the destination area.
 */
function drawTiled(
	ctx: CanvasRenderingContext2D,
	atlas: CanvasImageSource,
	srcX: number, srcY: number, srcW: number, srcH: number,
	destX: number, destY: number, destW: number, destH: number
): void
{
	ctx.save();
	ctx.beginPath();
	ctx.rect(destX, destY, destW, destH);
	ctx.clip();

	for(let ty = 0; ty < destH; ty += srcH)
	{
		for(let tx = 0; tx < destW; tx += srcW)
		{
			const drawW = Math.min(srcW, destW - tx);
			const drawH = Math.min(srcH, destH - ty);

			ctx.drawImage(atlas, srcX, srcY, drawW, drawH, destX + tx, destY + ty, drawW, drawH);
		}
	}

	ctx.restore();
}

/**
 * Apply color multiplication to a drawn piece.
 *
 * Uses canvas composite operations to multiply the piece by the given color
 * while preserving the original alpha channel.
 */
function colorize(
	ctx: CanvasRenderingContext2D,
	colorHex: string,
	destX: number, destY: number, destW: number, destH: number,
	atlas: CanvasImageSource,
	srcX: number, srcY: number, srcW: number, srcH: number,
	isTiled: boolean
): void
{
	// Save current composite state
	const prevComposite = ctx.globalCompositeOperation;

	// Multiply by the color
	ctx.globalCompositeOperation = 'multiply';
	ctx.fillStyle = colorHex;
	ctx.fillRect(destX, destY, destW, destH);

	// Restore alpha from the original piece
	ctx.globalCompositeOperation = 'destination-in';

	if(isTiled)
	{
		drawTiled(ctx, atlas, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
	}
	else
	{
		ctx.drawImage(atlas, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
	}

	// Restore composite operation
	ctx.globalCompositeOperation = prevComposite;
}
