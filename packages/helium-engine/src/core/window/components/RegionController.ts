import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IRegionWindow} from './IRegionWindow';
import {InteractiveController} from './InteractiveController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for region windows.
 *
 * An interactive area that captures mouse events without rendering
 * visual content of its own. Useful for defining clickable/hoverable
 * zones within container layouts.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/RegionController.as
 */
export class RegionController extends InteractiveController implements IRegionWindow
{
	constructor(
		name: string,
		type: number,
		style: number,
		param: number,
		context: IWindowContext,
		rect: { x: number; y: number; width: number; height: number },
		parent: IWindow | null = null,
		procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
		tags: string[] | null = null,
		properties: unknown[] | null = null,
		id: number = 0,
		dynamicStyle: string = ''
	)
	{
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);
	}
}
