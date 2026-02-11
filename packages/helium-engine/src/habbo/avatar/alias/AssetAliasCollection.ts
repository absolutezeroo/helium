import { AssetAlias } from './AssetAlias';

/**
 * Collection of asset aliases for resolving avatar asset names.
 *
 * @see sources/win63_version/habbo/avatar/alias/AssetAliasCollection.as
 */
export class AssetAliasCollection
{
    private _aliases: Map<string, AssetAlias>;

    constructor()
    {
        this._aliases = new Map();
    }

    public init(): void
    {
        // Initialization handled by onAvatarAssetsLibraryReady
    }

    public reset(): void
    {
        this.init();
    }

    public onAvatarAssetsLibraryReady(libraryName: string, aliases: any[]): void
    {
        if(aliases)
        {
            for(const aliasData of aliases)
            {
                const name = String(aliasData.name);

                this._aliases.set(name, new AssetAlias(aliasData));
            }
        }
    }

    public addAlias(name: string, link: string, flipH: boolean = false, flipV: boolean = false): void
    {
        const alias = new AssetAlias({ name, link, fliph: flipH ? 1 : 0, flipv: flipV ? 1 : 0 });

        this._aliases.set(name, alias);
    }

    public hasAlias(name: string): boolean
    {
        return this._aliases.has(name);
    }

    public getAssetName(name: string): string
    {
        let result = name;
        let depth = 5;

        while(this.hasAlias(result) && depth >= 0)
        {
            const alias = this._aliases.get(result)!;

            result = alias.link;
            depth--;
        }

        return result;
    }

    public dispose(): void
    {
        this._aliases.clear();
    }
}
