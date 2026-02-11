/**
 * Represents a single frame within an animation action part.
 *
 * @see sources/win63_version/habbo/avatar/structure/animation/AnimationFrame.as
 */
export class AnimationFrame
{
    private _number: number;
    private _assetPartDefinition: string;

    constructor(data: any)
    {
        this._number = parseInt(data.number) || 0;
        this._assetPartDefinition = String(data.assetpartdefinition ?? '');
    }

    public get number(): number
    {
        return this._number;
    }

    public get assetPartDefinition(): string
    {
        return this._assetPartDefinition;
    }
}
