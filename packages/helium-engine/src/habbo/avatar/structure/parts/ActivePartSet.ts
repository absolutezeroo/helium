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

        // Nitro: activeParts (camelCase array), XML-JSON: activePart
        const rawParts = data.activeParts || data.activePart;

        if(rawParts)
        {
            const activeParts: any[] = Array.isArray(rawParts) ? rawParts : [rawParts];

            for(const part of activeParts)
            {
                // Nitro: camelCase (setType), XML-JSON: hyphenated (set-type)
                this._parts.push(String(part.setType ?? part['set-type']));
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
