import type {Texture} from 'pixi.js';
import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IBitmapWrapperWindow} from './IBitmapWrapperWindow';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for bitmap wrapper windows.
 *
 * Wraps a bitmap image referenced by URL or programmatic Texture
 * for display within the window system.
 *
 * In AS3, IBitmapWrapperWindow had a `bitmap: BitmapData` property
 * for programmatic images. Here we support both `imageUrl` (static)
 * and `texture` (programmatic PixiJS Texture).
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/BitmapWrapperController.as
 */
export class BitmapWrapperController extends WindowController implements IBitmapWrapperWindow
{
    private _imageUrl: string = '';
    private _texture: Texture | null = null;
    private _disposesBitmap: boolean = false;

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

    public get imageUrl(): string
    {
        return this._imageUrl;
    }

    public set imageUrl(value: string)
    {
        this._imageUrl = value ?? '';
    }

    /**
     * Programmatic texture set by code (e.g. avatar rendering).
     *
     * Equivalent to AS3's `IBitmapWrapperWindow.bitmap` (BitmapData).
     */
    public get texture(): Texture | null
    {
        return this._texture;
    }

    public set texture(value: Texture | null)
    {
        if(this._disposesBitmap && this._texture && this._texture !== value)
        {
            this._texture.destroy();
        }

        this._texture = value;
    }

    /**
     * Whether this window owns the texture and should dispose it.
     */
    public get disposesBitmap(): boolean
    {
        return this._disposesBitmap;
    }

    public set disposesBitmap(value: boolean)
    {
        this._disposesBitmap = value;
    }

    /**
     * Invalidate the bitmap, triggering a re-render.
     */
    public override invalidate(rect: { x: number; y: number; width: number; height: number } | null = null): void
    {
        super.invalidate(rect);
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        if(this._disposesBitmap && this._texture)
        {
            this._texture.destroy();
            this._texture = null;
        }

        super.dispose();
    }
}
