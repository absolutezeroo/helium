import { Texture } from 'pixi.js';

/**
 * Container for a rendered avatar body part image.
 * Holds the composited texture, registration point, offset, and cacheability flag.
 *
 * @see sources/win63_version/habbo/avatar/AvatarImageBodyPartContainer.as
 */
export class AvatarImageBodyPartContainer
{
    private _image: Texture | null;
    private _regPoint: { x: number; y: number };
    private _offset: { x: number; y: number };
    private _isCacheable: boolean;

    constructor(
        image: Texture | null,
        regPoint: { x: number; y: number },
        isCacheable: boolean
    )
    {
        this._offset = { x: 0, y: 0 };
        this._image = image;
        this._regPoint = { x: regPoint.x, y: regPoint.y };
        this._isCacheable = isCacheable;
        this.cleanPoints();
    }

    /**
     * Whether this body part container can be cached.
     */
    public get isCacheable(): boolean
    {
        return this._isCacheable;
    }

    /**
     * The rendered texture for this body part.
     */
    public get image(): Texture | null
    {
        return this._image;
    }

    /**
     * Sets the rendered texture, disposing the previous one if different.
     */
    public set image(value: Texture | null)
    {
        if(this._image && this._image !== value)
        {
            this._image.destroy();
        }

        this._image = value;
    }

    /**
     * Sets the registration point and rounds coordinates.
     */
    public setRegPoint(point: { x: number; y: number }): void
    {
        this._regPoint = { x: point.x, y: point.y };
        this.cleanPoints();
    }

    /**
     * The combined registration point (regPoint + offset).
     */
    public get regPoint(): { x: number; y: number }
    {
        return {
            x: this._regPoint.x + this._offset.x,
            y: this._regPoint.y + this._offset.y
        };
    }

    /**
     * Sets the offset and rounds coordinates.
     */
    public set offset(value: { x: number; y: number })
    {
        this._offset = { x: value.x, y: value.y };
        this.cleanPoints();
    }

    /**
     * Rounds all point coordinates to integers (mimics AS3 int() cast).
     */
    private cleanPoints(): void
    {
        this._regPoint.x = Math.trunc(this._regPoint.x);
        this._regPoint.y = Math.trunc(this._regPoint.y);
        this._offset.x = Math.trunc(this._offset.x);
        this._offset.y = Math.trunc(this._offset.y);
    }

    /**
     * Disposes the texture and nullifies references.
     */
    public dispose(): void
    {
        if(this._image)
        {
            this._image.destroy();
        }

        this._image = null;
        this._regPoint = null!;
        this._offset = null!;
    }
}
