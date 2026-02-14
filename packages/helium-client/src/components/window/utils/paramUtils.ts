import {WindowParam} from '@habbo/window/enum/WindowParam';
import type {JSX} from 'solid-js';

/**
 * Interpret param flags for CSS alignment and scaling behavior.
 *
 * @see sources/flash_version/com/sulake/core/window/enum/WindowParam.as
 */

/**
 * Check if a param flag is set.
 */
export function hasParam(params: number, flag: number): boolean
{
	return (params & flag) === flag;
}

/**
 * Check if the element is draggable.
 */
export function isDraggable(params: number): boolean
{
	return hasParam(params, WindowParam.DRAGGABLE_WITH_MOUSE);
}

/**
 * Check if the element clips its children.
 */
export function isClipping(params: number): boolean
{
	return hasParam(params, WindowParam.FORCE_CLIPPING);
}

/**
 * Get horizontal alignment from param flags.
 */
export function getHorizontalAlign(params: number): 'left' | 'center' | 'right'
{
	if(hasParam(params, WindowParam.ON_RESIZE_ALIGN_CENTER))
	{
		return 'center';
	}

	if(hasParam(params, WindowParam.ON_RESIZE_ALIGN_RIGHT))
	{
		return 'right';
	}

	return 'left';
}

/**
 * Get vertical alignment from param flags.
 */
export function getVerticalAlign(params: number): 'top' | 'middle' | 'bottom'
{
	if(hasParam(params, WindowParam.ON_RESIZE_ALIGN_MIDDLE))
	{
		return 'middle';
	}

	if(hasParam(params, WindowParam.ON_RESIZE_ALIGN_BOTTOM))
	{
		return 'bottom';
	}

	return 'top';
}

/**
 * Build CSS flex alignment props from param flags.
 */
export function getAlignmentStyle(params: number): JSX.CSSProperties
{
	const style: JSX.CSSProperties = {};
	const hAlign = getHorizontalAlign(params);
	const vAlign = getVerticalAlign(params);

	if(hAlign === 'center')
	{
		style['justify-content'] = 'center';
	}
	else if(hAlign === 'right')
	{
		style['justify-content'] = 'flex-end';
	}

	if(vAlign === 'middle')
	{
		style['align-items'] = 'center';
	}
	else if(vAlign === 'bottom')
	{
		style['align-items'] = 'flex-end';
	}

	return style;
}

/**
 * Check if element should stretch horizontally with parent.
 */
export function isHorizontalStretch(params: number): boolean
{
	return hasParam(params, WindowParam.RELATIVE_HORIZONTAL_SCALE_STRETCH);
}

/**
 * Check if element should stretch vertically with parent.
 */
export function isVerticalStretch(params: number): boolean
{
	return hasParam(params, WindowParam.RELATIVE_VERTICAL_SCALE_STRETCH);
}
