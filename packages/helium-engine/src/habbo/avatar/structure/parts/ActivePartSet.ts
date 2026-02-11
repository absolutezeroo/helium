/**
 * Represents a named set of active body part types used during avatar rendering.
 *
 * @see sources/win63_version/habbo/avatar/structure/parts/ActivePartSet.as
 */
export class ActivePartSet
{
    private _id: string;
    private _parts: string[];

    constructor(data: any)
    {
        this._id = String(data.id ?? '');
        this._parts = [];

        if(data.activePart)
        {
            const activeParts: any[] = Array.isArray(data.activePart) ? data.activePart : [data.activePart];

            for(const part of activeParts)
            {
                this._parts.push(String(part['set-type']));
            }
        }
    }

    public get id(): string
    {
        return this._id;
    }

    public get parts(): string[]
    {
        return this._parts;
    }
}
