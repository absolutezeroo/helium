/**
 * Represents an asset alias mapping one asset name to another, with optional flipping.
 * Parsed from JSON with properties: name, link, fliph, flipv.
 *
 * @see sources/win63_version/habbo/avatar/alias/AssetAlias.as
 */
export class AssetAlias
{
    private _name: string;
    private _link: string;
    private _flipH: boolean;
    private _flipV: boolean;

    constructor(data: any)
    {
        this._name = String(data.name ?? '');
        this._link = String(data.link ?? '');
        this._flipH = Boolean(parseInt(data.fliph));
        this._flipV = Boolean(parseInt(data.flipv));
    }

    /**
     * The alias name.
     */
    public get name(): string
    {
        return this._name;
    }

    /**
     * The linked asset name this alias points to.
     */
    public get link(): string
    {
        return this._link;
    }

    /**
     * Whether the asset should be flipped horizontally.
     */
    public get flipH(): boolean
    {
        return this._flipH;
    }

    /**
     * Whether the asset should be flipped vertically.
     */
    public get flipV(): boolean
    {
        return this._flipV;
    }
}
