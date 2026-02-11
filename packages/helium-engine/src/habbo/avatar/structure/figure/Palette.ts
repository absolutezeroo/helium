import type { IPartColor } from './IPartColor';
import type { IPalette } from './IPalette';
import { PartColor } from './PartColor';

/**
 * Represents a color palette for avatar figure parts, parsed from JSON.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/Palette.as
 */
export class Palette implements IPalette
{
    private _id: number;
    private _colors: Map<number, IPartColor>;

    constructor(data: any)
    {
        this._id = parseInt(data.id) || 0;
        this._colors = new Map();
        this.append(data);
    }

    /**
     * Appends color entries from JSON data to this palette.
     *
     * @param data - The palette JSON data containing a color array
     */
    public append(data: any): void
    {
        if(!data.color) return;

        const colors: any[] = Array.isArray(data.color) ? data.color : [data.color];

        for(const colorData of colors)
        {
            const id = parseInt(colorData.id) || 0;
            this._colors.set(id, new PartColor(colorData));
        }
    }

    public get id(): number
    {
        return this._id;
    }

    /**
     * Retrieves a color by its identifier.
     *
     * @param colorId - The color identifier
     * @returns The matching part color, or null if not found
     */
    public getColor(colorId: number): IPartColor | null
    {
        return this._colors.get(colorId) ?? null;
    }

    public get colors(): Map<number, IPartColor>
    {
        return this._colors;
    }
}
