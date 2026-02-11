import type { IFigurePart } from './IFigurePart';
import type { IFigurePartSet } from './IFigurePartSet';
import { FigurePart } from './FigurePart';

/**
 * Represents a set of figure parts parsed from figure data JSON.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/FigurePartSet.as
 */
export class FigurePartSet implements IFigurePartSet
{
    private _type: string;
    private _id: number;
    private _gender: string;
    private _clubLevel: number;
    private _isColorable: boolean;
    private _isSelectable: boolean;
    private _isPreSelectable: boolean;
    private _isSellable: boolean;
    private _parts: IFigurePart[];
    private _hiddenLayers: string[];

    constructor(data: any, type: string)
    {
        this._type = type;
        this._id = parseInt(data.id) || 0;
        this._gender = String(data.gender || '');
        this._clubLevel = parseInt(data.club) || 0;
        this._isColorable = Boolean(parseInt(data.colorable));
        this._isSelectable = Boolean(parseInt(data.selectable));
        this._isPreSelectable = Boolean(parseInt(data.preselectable));
        this._isSellable = Boolean(parseInt(data.sellable));
        this._parts = [];
        this._hiddenLayers = [];

        if(data.part)
        {
            const parts: any[] = Array.isArray(data.part) ? data.part : [data.part];

            for(const partData of parts)
            {
                const figurePart = new FigurePart(partData);
                const insertIndex = this._indexOfPartType(figurePart);

                if(insertIndex !== -1)
                {
                    this._parts.splice(insertIndex, 0, figurePart);
                }
                else
                {
                    this._parts.push(figurePart);
                }
            }
        }

        if(data.hiddenlayers && data.hiddenlayers.layer)
        {
            const layers: any[] = Array.isArray(data.hiddenlayers.layer)
                ? data.hiddenlayers.layer
                : [data.hiddenlayers.layer];

            for(const layer of layers)
            {
                this._hiddenLayers.push(String(layer.parttype));
            }
        }
    }

    /**
     * Finds the insertion index for a part based on type and index ordering.
     *
     * @param part - The figure part to find insertion position for
     * @returns The insertion index, or -1 if the part should be appended
     */
    private _indexOfPartType(part: FigurePart): number
    {
        for(let i = 0; i < this._parts.length; i++)
        {
            const existing = this._parts[i];

            if(existing.type === part.type && existing.index < part.index)
            {
                return i;
            }
        }

        return -1;
    }

    /**
     * Finds a part by type and id.
     *
     * @param type - The part type identifier
     * @param id - The part id
     * @returns The matching figure part, or null if not found
     */
    public getPart(type: string, id: number): IFigurePart | null
    {
        for(const part of this._parts)
        {
            if(part.type === type && part.id === id)
            {
                return part;
            }
        }

        return null;
    }

    public get type(): string
    {
        return this._type;
    }

    public get id(): number
    {
        return this._id;
    }

    public get gender(): string
    {
        return this._gender;
    }

    public get clubLevel(): number
    {
        return this._clubLevel;
    }

    public get isColorable(): boolean
    {
        return this._isColorable;
    }

    public get isSelectable(): boolean
    {
        return this._isSelectable;
    }

    public get isPreSelectable(): boolean
    {
        return this._isPreSelectable;
    }

    public get isSellable(): boolean
    {
        return this._isSellable;
    }

    public get parts(): IFigurePart[]
    {
        return this._parts;
    }

    public get hiddenLayers(): string[]
    {
        return this._hiddenLayers;
    }

    public dispose(): void
    {
        this._parts = [];
        this._hiddenLayers = [];
    }
}
