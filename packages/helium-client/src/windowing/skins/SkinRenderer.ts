import { SkinLayout, SkinTemplate } from './SkinModels';

export class SkinRenderer
{
    private readonly _name: string;
    private _disposed: boolean;

    protected readonly _layoutsByName: Map<string, SkinLayout>;
    protected readonly _templatesByName: Map<string, SkinTemplate>;
    protected readonly _layoutsByState: Map<number, SkinLayout>;
    protected readonly _templatesByState: Map<number, SkinTemplate>;

    public constructor(name: string)
    {
        this._name = name;
        this._disposed = false;
        this._layoutsByName = new Map();
        this._templatesByName = new Map();
        this._layoutsByState = new Map();
        this._templatesByState = new Map();
    }

    public get name(): string
    {
        return this._name;
    }

    public addLayout(layout: SkinLayout): SkinLayout
    {
        this._layoutsByName.set(layout.name, layout);
        return layout;
    }

    public addTemplate(template: SkinTemplate): SkinTemplate
    {
        this._templatesByName.set(template.name, template);
        return template;
    }

    public getLayoutByName(name: string): SkinLayout | undefined
    {
        return this._layoutsByName.get(name);
    }

    public getTemplateByName(name: string): SkinTemplate | undefined
    {
        return this._templatesByName.get(name);
    }

    public getLayoutByState(state: number): SkinLayout | undefined
    {
        return this._layoutsByState.get(state);
    }

    public getTemplateByState(state: number): SkinTemplate | undefined
    {
        return this._templatesByState.get(state);
    }

    public registerLayoutForRenderState(state: number, layoutName: string): void
    {
        const layout = this._layoutsByName.get(layoutName);
        if (!layout)
        {
            return;
        }

        this._layoutsByState.set(state, layout);
    }

    public registerTemplateForRenderState(state: number, templateName: string): void
    {
        const template = this._templatesByName.get(templateName);
        if (!template)
        {
            return;
        }

        this._templatesByState.set(state, template);
    }

    public removeLayoutFromRenderState(state: number): void
    {
        this._layoutsByState.delete(state);
    }

    public removeTemplateFromRenderState(state: number): void
    {
        this._templatesByState.delete(state);
    }

    public hasLayoutForState(state: number): boolean
    {
        return this._layoutsByState.has(state);
    }

    public hasTemplateForState(state: number): boolean
    {
        return this._templatesByState.has(state);
    }

    public isStateDrawable(state: number): boolean
    {
        return this._templatesByState.has(state);
    }

    public dispose(): void
    {
        if (this._disposed)
        {
            return;
        }

        this._disposed = true;
        this._layoutsByName.clear();
        this._templatesByName.clear();
        this._layoutsByState.clear();
        this._templatesByState.clear();
    }
}
