import type { CompiledSkinLayout, CompiledSkinLayoutEntity, CompiledSkinTemplate, CompiledSkinTemplateEntity, SkinRect } from '../types/Skin';

export class SkinTemplateEntity
{
    public readonly id: number;
    public readonly name: string;
    public readonly type: string;
    public readonly region: SkinRect;

    public constructor(data: CompiledSkinTemplateEntity)
    {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.region = data.region;
    }
}

export class SkinTemplate
{
    public readonly name: string;
    public readonly asset: string;

    private readonly _entities: Map<string, SkinTemplateEntity>;
    private _disposed: boolean;

    public constructor(data: CompiledSkinTemplate)
    {
        this.name = data.name;
        this.asset = data.asset;
        this._entities = new Map();
        this._disposed = false;

        data.entities.forEach((entity) =>
        {
            this._entities.set(entity.name, new SkinTemplateEntity(entity));
        });
    }

    public getEntity(name: string): SkinTemplateEntity | undefined
    {
        return this._entities.get(name);
    }

    public dispose(): void
    {
        if (this._disposed)
        {
            return;
        }

        this._disposed = true;
        this._entities.clear();
    }
}

export class SkinLayoutEntity
{
    public readonly id: number;
    public readonly name: string;
    public readonly colorize: boolean;
    public readonly color: number;
    public readonly blend: number;
    public readonly scaleH: number;
    public readonly scaleV: number;
    public readonly region: SkinRect;

    public constructor(data: CompiledSkinLayoutEntity)
    {
        this.id = data.id;
        this.name = data.name;
        this.colorize = data.colorize;
        this.color = data.color;
        this.blend = data.blend;
        this.scaleH = data.scaleH;
        this.scaleV = data.scaleV;
        this.region = data.region;
    }
}

export class SkinLayout
{
    public readonly name: string;
    public readonly transparent: boolean;
    public readonly blendMode: string;

    private _width: number;
    private _height: number;
    private readonly _entities: SkinLayoutEntity[];
    private readonly _entitiesByName: Map<string, SkinLayoutEntity>;
    private _disposed: boolean;

    public constructor(data: CompiledSkinLayout)
    {
        this.name = data.name;
        this.transparent = data.transparent;
        this.blendMode = data.blendMode;
        this._width = 0;
        this._height = 0;
        this._entities = [];
        this._entitiesByName = new Map();
        this._disposed = false;

        data.entities.forEach((entity) =>
        {
            this.addEntity(new SkinLayoutEntity(entity));
        });
    }

    public get width(): number
    {
        return this._width;
    }

    public get height(): number
    {
        return this._height;
    }

    public get entities(): SkinLayoutEntity[]
    {
        return this._entities;
    }

    public getEntity(name: string): SkinLayoutEntity | undefined
    {
        return this._entitiesByName.get(name);
    }

    private addEntity(entity: SkinLayoutEntity): void
    {
        this._entities.push(entity);
        this._entitiesByName.set(entity.name, entity);
        this._width = Math.max(this._width, entity.region.x + entity.region.width);
        this._height = Math.max(this._height, entity.region.y + entity.region.height);
    }

    public dispose(): void
    {
        if (this._disposed)
        {
            return;
        }

        this._disposed = true;
        this._entities.length = 0;
        this._entitiesByName.clear();
    }
}
