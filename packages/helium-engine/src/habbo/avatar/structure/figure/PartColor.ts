import type { IPartColor } from './IPartColor';

/**
 * Represents a color entry parsed from a palette in figure data JSON.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/PartColor.as
 */
export class PartColor implements IPartColor
{
    private _id: number;
    private _index: number;
    private _clubLevel: number;
    private _isSelectable: boolean;
    private _rgb: number;
    private _r: number;
    private _g: number;
    private _b: number;
    private _redMultiplier: number;
    private _greenMultiplier: number;
    private _blueMultiplier: number;
    private _colorTransform: { redMultiplier: number; greenMultiplier: number; blueMultiplier: number };

    constructor(data: any)
    {
        this._id = parseInt(data.id) || 0;
        this._index = parseInt(data.index) || 0;
        this._clubLevel = parseInt(data.club) || 0;
        this._isSelectable = Boolean(parseInt(data.selectable));

        const colorHex: string = String(data.color || '0');
        this._rgb = parseInt(colorHex, 16);
        this._r = (this._rgb >> 16) & 0xFF;
        this._g = (this._rgb >> 8) & 0xFF;
        this._b = this._rgb & 0xFF;
        this._redMultiplier = (this._r / 255) * 1;
        this._greenMultiplier = (this._g / 255) * 1;
        this._blueMultiplier = (this._b / 255) * 1;
        this._colorTransform = {
            redMultiplier: this._redMultiplier,
            greenMultiplier: this._greenMultiplier,
            blueMultiplier: this._blueMultiplier
        };
    }

    public get id(): number
    {
        return this._id;
    }

    public get index(): number
    {
        return this._index;
    }

    public get clubLevel(): number
    {
        return this._clubLevel;
    }

    public get isSelectable(): boolean
    {
        return this._isSelectable;
    }

    public get rgb(): number
    {
        return this._rgb;
    }

    public get r(): number
    {
        return this._r;
    }

    public get g(): number
    {
        return this._g;
    }

    public get b(): number
    {
        return this._b;
    }

    public get colorTransform(): { redMultiplier: number; greenMultiplier: number; blueMultiplier: number }
    {
        return this._colorTransform;
    }

    public get redMultiplier(): number
    {
        return this._redMultiplier;
    }

    public get greenMultiplier(): number
    {
        return this._greenMultiplier;
    }

    public get blueMultiplier(): number
    {
        return this._blueMultiplier;
    }
}
