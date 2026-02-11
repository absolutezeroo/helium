import type { IFigurePart } from './IFigurePart';

/**
 * Represents a single figure part parsed from figure data JSON.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/FigurePart.as
 */
export class FigurePart implements IFigurePart
{
    private _id: number;
    private _type: string;
    private _breed: number;
    private _colorLayerIndex: number;
    private _index: number;
    private _paletteMap: number;

    constructor(data: any)
    {
        this._id = parseInt(data.id) || 0;
        this._type = String(data.type || '');
        this._index = parseInt(data.index) || 0;
        this._colorLayerIndex = parseInt(data.colorindex) || 0;

        const breed: string = String(data.breed ?? '');
        this._breed = (breed !== '') ? parseInt(breed) : -1;

        const paletteMapId: string = String(data.palettemapid ?? '');
        this._paletteMap = (paletteMapId !== '') ? parseInt(paletteMapId) : -1;
    }

    public get id(): number
    {
        return this._id;
    }

    public get type(): string
    {
        return this._type;
    }

    public get breed(): number
    {
        return this._breed;
    }

    public get colorLayerIndex(): number
    {
        return this._colorLayerIndex;
    }

    public get index(): number
    {
        return this._index;
    }

    public get paletteMap(): number
    {
        return this._paletteMap;
    }

    public dispose(): void
    {
    }
}
