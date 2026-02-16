import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IHTMLTextWindow} from './IHTMLTextWindow';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {PropertyStruct} from '../utils/PropertyStruct';

/**
 * Controller for HTML text windows with link support.
 *
 * Extends WindowController with HTML text rendering and link event
 * handling. In AS3, this extended TextFieldController.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/HTMLTextController.as
 */
export class HTMLTextController extends WindowController implements IHTMLTextWindow
{
	private static readonly HTML_STYLESHEET_KEY: string = 'html_stylesheet';

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
		id: number = 0
	)
	{
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);

		this._hasVisualContent = true;
		this.immediateClickMode = true;
	}

	private static _defaultLinkTarget: string = 'default';

	public static get defaultLinkTarget(): string
	{
		return HTMLTextController._defaultLinkTarget;
	}

	/**
	 * The default link target for all HTMLTextController instances.
	 */
	public static set defaultLinkTarget(value: string)
	{
		HTMLTextController._defaultLinkTarget = value;
	}

	private _html: string = '';

	/**
	 * The HTML content.
	 */
	public get html(): string
	{
		return this._html;
	}

	public set html(value: string)
	{
		if (value === null)
		{
			return;
		}

		this._html = value;
	}

	private _linkTarget: string = 'default';

	/**
	 * The link target for hyperlinks in this window.
	 */
	public get linkTarget(): string
	{
		return this._linkTarget === 'default' ? HTMLTextController._defaultLinkTarget : this._linkTarget;
	}

	public set linkTarget(value: string)
	{
		this._linkTarget = value;
	}

	private _htmlStyleSheetString: string | null = null;

	/**
	 * The CSS stylesheet string for HTML rendering.
	 */
	public get htmlStyleSheetString(): string | null
	{
		return this._htmlStyleSheetString;
	}

	public set htmlStyleSheetString(value: string | null)
	{
		this._htmlStyleSheetString = value;
	}

	public override get properties(): unknown[]
	{
		const props = super.properties;

		props.push(this.createProperty('link_target', this._linkTarget));

		return props;
	}

	public override set properties(value: unknown[])
	{
		for (const item of value)
		{
			const prop = item as PropertyStruct;

			switch (prop.key)
			{
				case 'link_target':
					this._linkTarget = prop.value as string;
					break;
				case 'html_stylesheet':
					this.htmlStyleSheetString = prop.value as string;
					break;
			}
		}

		super.properties = value;
	}
}
