import type { IMargins } from './IMargins';

/**
 * Text margin implementation.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/TextMargins.as
 */
export class TextMargins implements IMargins
{
    public left: number;
    public top: number;
    public right: number;
    public bottom: number;

    constructor(left: number = 0, top: number = 0, right: number = 0, bottom: number = 0)
    {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }

    public clone(): TextMargins
    {
        return new TextMargins(this.left, this.top, this.right, this.bottom);
    }
}
