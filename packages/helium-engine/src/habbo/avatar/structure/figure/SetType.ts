import type { IFigurePartSet } from './IFigurePartSet';
import type { ISetType } from './ISetType';
import { FigurePartSet } from './FigurePartSet';

/**
 * Represents a figure set type containing part sets and mandatory configuration.
 * Parsed from JSON figure data.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/SetType.as
 */
export class SetType implements ISetType
{
    private _type: string;
    private _paletteID: number;
    private _isMandatory: Map<string, boolean[]>;
    private _partSets: Map<string, IFigurePartSet>;

    constructor(data: any)
    {
        this._type = String(data.type || '');
        this._paletteID = parseInt(data.paletteid) || 0;

        this._isMandatory = new Map();
        this._isMandatory.set('F', [
            Boolean(parseInt(data.mand_f_0)),
            Boolean(parseInt(data.mand_f_1))
        ]);
        this._isMandatory.set('M', [
            Boolean(parseInt(data.mand_m_0)),
            Boolean(parseInt(data.mand_m_1))
        ]);

        this._partSets = new Map();
        this.append(data);
    }

    /**
     * Appends part sets from JSON data to this set type.
     *
     * @param data - The set type JSON data containing a set array
     */
    public append(data: any): void
    {
        if(!data.set) return;

        const sets: any[] = Array.isArray(data.set) ? data.set : [data.set];

        for(const setData of sets)
        {
            const id = String(setData.id);
            this._partSets.set(id, new FigurePartSet(setData, this._type));
        }
    }

    /**
     * Removes part sets that match the IDs in the given data.
     *
     * @param data - The JSON data containing set entries to remove
     */
    public cleanUp(data: any): void
    {
        if(!data.set) return;

        const sets: any[] = Array.isArray(data.set) ? data.set : [data.set];

        for(const setData of sets)
        {
            const id = String(setData.id);
            const partSet = this._partSets.get(id);

            if(partSet)
            {
                this._partSets.delete(id);
            }
        }
    }

    /**
     * Gets the default part set for the given gender (club level 0).
     *
     * @param gender - The gender identifier ("M", "F", or "U")
     * @returns The default part set, or null if none found
     */
    public getDefaultPartSet(gender: string): IFigurePartSet | null
    {
        const keys = Array.from(this._partSets.keys());

        for(let i = keys.length - 1; i >= 0; i--)
        {
            const partSet = this._partSets.get(keys[i])!;

            if(partSet && partSet.clubLevel === 0 && (partSet.gender === gender || partSet.gender === 'U'))
            {
                return partSet;
            }
        }

        return null;
    }

    /**
     * Gets a part set by its numeric identifier.
     *
     * @param id - The part set identifier
     * @returns The matching part set, or null if not found
     */
    public getPartSet(id: number): IFigurePartSet | null
    {
        return this._partSets.get(String(id)) ?? null;
    }

    public get type(): string
    {
        return this._type;
    }

    public get paletteID(): number
    {
        return this._paletteID;
    }

    /**
     * Checks whether this set type is mandatory for the given gender and club level.
     *
     * @param gender - The gender identifier ("M" or "F")
     * @param clubLevel - The club membership level
     * @returns True if mandatory
     */
    public isMandatory(gender: string, clubLevel: number): boolean
    {
        const mandatory = this._isMandatory.get(gender.toUpperCase());

        if(!mandatory) return false;

        return mandatory[Math.min(clubLevel, 1)];
    }

    /**
     * Gets the club level from which this set type becomes optional.
     *
     * @param gender - The gender identifier
     * @returns The club level index at which it becomes optional, or -1
     */
    public optionalFromClubLevel(gender: string): number
    {
        const mandatory = this._isMandatory.get(gender.toUpperCase());

        if(!mandatory) return -1;

        return mandatory.indexOf(false);
    }

    public get partSets(): Map<string, IFigurePartSet>
    {
        return this._partSets;
    }

    public dispose(): void
    {
        this._partSets.clear();
    }
}
