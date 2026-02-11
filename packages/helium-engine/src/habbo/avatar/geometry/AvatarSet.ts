/**
 * Represents a set of body parts for avatar rendering.
 *
 * @see sources/win63_version/habbo/avatar/geometry/AvatarSet.as
 */
export class AvatarSet
{
    private _id: string;
    private _subSets: Map<string, AvatarSet>;
    private _bodyPartIds: string[];
    private _allBodyPartIds: string[];
    private _isMain: boolean;

    constructor(data: any)
    {
        this._id = String(data.id);

        const mainStr = data.main;

        this._isMain = mainStr == null ? false : Boolean(parseInt(mainStr));
        this._subSets = new Map();
        this._bodyPartIds = [];

        if(data.avatarsets)
        {
            for(const subData of data.avatarsets)
            {
                const subSet = new AvatarSet(subData);

                this._subSets.set(String(subData.id), subSet);
            }
        }

        if(data.bodyparts)
        {
            for(const bp of data.bodyparts)
            {
                this._bodyPartIds.push(String(bp.id));
            }
        }

        let all = [...this._bodyPartIds];

        for(const subSet of this._subSets.values())
        {
            all = all.concat(subSet.getBodyParts());
        }

        this._allBodyPartIds = all;
    }

    public findAvatarSet(id: string): AvatarSet | null
    {
        if(id === this._id) return this;

        for(const subSet of this._subSets.values())
        {
            if(subSet.findAvatarSet(id) != null) return subSet;
        }

        return null;
    }

    public getBodyParts(): string[]
    {
        return [...this._allBodyPartIds];
    }

    public get id(): string
    {
        return this._id;
    }

    public get isMain(): boolean
    {
        if(this._isMain) return true;

        for(const subSet of this._subSets.values())
        {
            if(subSet.isMain) return true;
        }

        return false;
    }
}
