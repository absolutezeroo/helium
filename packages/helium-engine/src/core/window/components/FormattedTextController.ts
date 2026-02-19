import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import {TextController} from './TextController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for formatted (HTML) text windows.
 *
 * Extends TextController and overrides `set text` to use htmlText
 * instead of plain text. In AS3, this set `_field.htmlText` on the
 * underlying TextField.
 *
 * @see sources/win63_version/core/window/components/FormattedTextController.as
 */
export class FormattedTextController extends TextController
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

	private _htmlText: string = '';

	/**
	 * The HTML text content.
	 */
	public get htmlText(): string
	{
		return this._htmlText;
	}

	/**
	 * Sets text content as HTML.
	 *
	 * In AS3, this stored to `_caption`, resolved localization tokens,
	 * then set `_field.htmlText` instead of `_field.text`.
	 */
	public override get text(): string
	{
		return this._text;
	}

	public override set text(value: string)
	{
		if (value == null) return;

		this._htmlText = value;
		this._text = value;
		this._caption = value;
		this._context.invalidate(this, null, 1);
	}
}
