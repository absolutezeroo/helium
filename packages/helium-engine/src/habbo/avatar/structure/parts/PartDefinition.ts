/**
 * Defines the relationship between a body part and its set types,
 * including flipping and removal mappings.
 *
 * @see sources/win63_version/habbo/avatar/structure/parts/PartDefinition.as
 */
export class PartDefinition
{
    private _setType: string;
    private _flippedSetType: string;
    private _removeSetType: string;
    private _appendToFigure: boolean;
    private _staticId: number;

    constructor(data: any)
    {
        this._setType = String(data['set-type'] ?? '');
        this._flippedSetType = String(data['flipped-set-type'] ?? '');
        this._removeSetType = String(data['remove-set-type'] ?? '');
        this._appendToFigure = false;
        this._staticId = -1;
    }

    /**
     * Checks whether this part definition has a static id assigned.
     *
     * @returns True if a static id has been set
     */
    public hasStaticId(): boolean
    {
        return this._staticId >= 0;
    }

    public get staticId(): number
    {
        return this._staticId;
    }

    public set staticId(value: number)
    {
        this._staticId = value;
    }

    public get setType(): string
    {
        return this._setType;
    }

    public get flippedSetType(): string
    {
        return this._flippedSetType;
    }

    public set flippedSetType(value: string)
    {
        this._flippedSetType = value;
    }

    public get removeSetType(): string
    {
        return this._removeSetType;
    }

    public get appendToFigure(): boolean
    {
        return this._appendToFigure;
    }

    public set appendToFigure(value: boolean)
    {
        this._appendToFigure = value;
    }
}
