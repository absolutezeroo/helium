import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {ITextLinkWindow} from './ITextLinkWindow';
import {TextController} from './TextController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for text link windows.
 *
 * Extends TextController with a link property representing
 * the URL or action target associated with the clickable text.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/TextLinkController.as
 */
export class TextLinkController extends TextController implements ITextLinkWindow
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
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);
	}

	private _link: string = '';

	public get link(): string
	{
		return this._link;
	}

	public set link(value: string)
	{
		this._link = value ?? '';
	}
}
