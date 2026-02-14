import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { IIconWindow } from './IIconWindow';
import { WindowController } from '../WindowController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Controller for icon windows.
 *
 * Displays a small image referenced by URL. Has visual content
 * enabled by default for rendering the icon graphic.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IconController.as
 */
export class IconController extends WindowController implements IIconWindow
{
    private _imageUrl: string = '';

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

        this._hasVisualContent = true;
    }

    public get imageUrl(): string
    {
        return this._imageUrl;
    }

    public set imageUrl(value: string)
    {
        this._imageUrl = value ?? '';
    }
}
