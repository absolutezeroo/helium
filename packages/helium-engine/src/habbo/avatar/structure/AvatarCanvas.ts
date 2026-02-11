import { AvatarScaleType } from '../enum/AvatarScaleType';

/**
 * Data class representing a canvas configuration for avatar rendering.
 * Parsed from JSON with properties: id, width, height, dx, dy.
 *
 * @see sources/win63_version/habbo/avatar/structure/AvatarCanvas.as
 */
export class AvatarCanvas
{
    private _id: string;
    private _width: number;
    private _height: number;
    private _offset: { x: number; y: number };
    private _regPoint: { x: number; y: number };

    constructor(data: any, scale: string)
    {
        this._id = String(data.id);
        this._width = parseInt(data.width) || 0;
        this._height = parseInt(data.height) || 0;
        this._offset = { x: parseInt(data.dx) || 0, y: parseInt(data.dy) || 0 };

        if(scale === AvatarScaleType.LARGE)
        {
            this._regPoint = { x: (this._width - 64) / 2, y: 0 };
        }
        else
        {
            this._regPoint = { x: (this._width - 32) / 2, y: 0 };
        }
    }

    /**
     * The canvas identifier.
     */
    public get id(): string
    {
        return this._id;
    }

    /**
     * The canvas width in pixels.
     */
    public get width(): number
    {
        return this._width;
    }

    /**
     * The canvas height in pixels.
     */
    public get height(): number
    {
        return this._height;
    }

    /**
     * The canvas offset point.
     */
    public get offset(): { x: number; y: number }
    {
        return this._offset;
    }

    /**
     * The canvas registration point used for alignment.
     */
    public get regPoint(): { x: number; y: number }
    {
        return this._regPoint;
    }
}
