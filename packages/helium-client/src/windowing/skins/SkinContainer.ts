import { DefaultAttStruct } from './DefaultAttStruct';
import { SkinRenderer } from './SkinRenderer';

const MAX_STYLE_COUNT = 100;
const STATES_BY_RENDER_PRIORITY = [64, 32, 16, 8, 4, 2, 1, 0];

export class SkinContainer
{
    private _disposed: boolean;
    private readonly _renderers: Map<number, Array<SkinRenderer | null>>;
    private readonly _defaults: Map<number, Array<DefaultAttStruct | null>>;
    private readonly _windowLayouts: Map<number, Array<string | null>>;
    private readonly _intents: Map<number, Array<string | null>>;

    public constructor()
    {
        this._disposed = false;
        this._renderers = new Map();
        this._defaults = new Map();
        this._windowLayouts = new Map();
        this._intents = new Map();
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public addSkinRenderer(
        type: number,
        style: number,
        intent: string,
        renderer: SkinRenderer,
        windowLayout: string | null,
        defaults: DefaultAttStruct
    ): void
    {
        if (!this._renderers.has(type))
        {
            this._renderers.set(type, new Array(MAX_STYLE_COUNT).fill(null));
        }

        if (!this._defaults.has(type))
        {
            this._defaults.set(type, new Array(MAX_STYLE_COUNT).fill(null));
        }

        if (!this._windowLayouts.has(type))
        {
            this._windowLayouts.set(type, new Array(MAX_STYLE_COUNT).fill(null));
        }

        if (!this._intents.has(type))
        {
            this._intents.set(type, new Array(MAX_STYLE_COUNT).fill(null));
        }

        this._renderers.get(type)![style] = renderer;
        this._defaults.get(type)![style] = defaults;
        this._windowLayouts.get(type)![style] = windowLayout ?? null;
        this._intents.get(type)![style] = intent && intent.length > 0 ? intent : String(style);
    }

    public getSkinRendererByTypeAndStyle(type: number, style: number): SkinRenderer | null
    {
        const renderers = this._renderers.get(type);
        if (!renderers)
        {
            return null;
        }

        return renderers[style] ?? (style !== 0 ? renderers[0] : null) ?? null;
    }

    public skinRendererExists(type: number, style: number): boolean
    {
        const renderers = this._renderers.get(type);
        return !!renderers && !!renderers[style];
    }

    public getDefaultAttributesByTypeAndStyle(type: number, style: number): DefaultAttStruct | null
    {
        const defaults = this._defaults.get(type);
        if (!defaults)
        {
            return null;
        }

        return defaults[style] ?? (style !== 0 ? defaults[0] : null) ?? null;
    }

    public getIntentByTypeAndStyle(type: number, style: number): string | null
    {
        const intents = this._intents.get(type);
        if (!intents)
        {
            return null;
        }

        return intents[style] ?? null;
    }

    public getTheActualState(type: number, style: number, state: number): number
    {
        const renderer = this.getSkinRendererByTypeAndStyle(type, style);
        if (!renderer)
        {
            return 0;
        }

        for (const candidate of STATES_BY_RENDER_PRIORITY)
        {
            if ((state & candidate) === candidate && renderer.isStateDrawable(candidate))
            {
                return candidate;
            }
        }

        return 0;
    }

    public dispose(): void
    {
        if (this._disposed)
        {
            return;
        }

        this._disposed = true;
        this._renderers.clear();
        this._defaults.clear();
        this._windowLayouts.clear();
        this._intents.clear();
    }
}
